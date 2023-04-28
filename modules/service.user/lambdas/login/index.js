/**
 * @fileoverview This module exports a Lambda function that handles user
 * authentication. It verifies the user's password, checks if the user is
 * confirmed, and generates an access token for the user upon successful
 * authentication. The function sends a success response with the access token
 * or an error response if the authentication fails.
 */

"use strict";

const jwt = require("jsonwebtoken");
const {
  getConfigurationFile,
  hashWithSalt,
  dbQuery,
  assertRequiredBodyParams,
} = require("./utils");

/**
 * Verifies the user's password.
 * @param {string} passwordHash - The stored password hash.
 * @param {string} salt - The salt used to hash the password.
 * @param {string} passwordAttempt - The user's attempted password.
 * @returns {Promise<boolean>} - True if the password is valid, false otherwise.
 */
const verifyPassword = async (passwordHash, salt, passwordAttempt) => {
  const [pbkdf2, { hash }] = await Promise.all([
    getConfigurationFile("crypto.config.json"),
    hashWithSalt(passwordAttempt, salt),
  ]);

  return passwordHash === hash.toString(pbkdf2.byte_to_string_encoding);
};

/**
 * Generates an access token for the user.
 * @param {string} username - The user's username.
 * @param {number} user_id - The user's id.
 * @returns {Promise<string>} - The access token.
 */
const generateAccessToken = async (username, user_id) => {
  const config = await getConfigurationFile("crypto.config.json");
  return jwt.sign(
    {
      user_id,
      username,
    },
    config.token_secret,
    { expiresIn: "1h" }
  );
};

/**
 * Retrieves the user's salt and password hash from the database.
 * @param {string} username - The user's username.
 * @returns {Promise<Object>} - An object containing the user's salt, password hash, user id, and confirmation status.
 */
const getSaltAndHashForUser = async (username) => {
  const result = await dbQuery(
    `
      SELECT 
        user_meta.meta_value as salt, 
        users.id as user_id, 
        users.password_hash as hash, 
        users.confirmed as confirmed
      FROM users
      INNER JOIN user_meta on users.id = user_meta.user_id
      WHERE users.username = :username
      AND user_meta.meta_key = 'salt';
    `,
    { username }
  );

  return result?.[0];
};

exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { username, password: passwordAttempt } =
      await assertRequiredBodyParams(requestBody, ["username", "password"]);

    // Get salt, hash, user_id, and confirmation status for the given username
    const { salt, hash, user_id, confirmed } = await getSaltAndHashForUser(
      username
    );

    // Check if the user is confirmed
    if (!confirmed) {
      throw new Error(
        "Unauthorized. User not yet confirmed. Please check your email."
      );
    }

    // Verify the user's password
    const valid = await verifyPassword(hash, salt, passwordAttempt);

    // Check if the password is valid
    if (!valid) {
      throw new Error("Unauthorized. Invalid username or password.");
    }

    // Generate an access token for the user
    const accessToken = await generateAccessToken(username, user_id);

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ access_token: accessToken }),
    });
  } catch (error) {
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: error.message,
      }),
    });
  }
};
