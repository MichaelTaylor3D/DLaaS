"use strict";

const jwt = require("jsonwebtoken");
const {
  getConfigurationFile,
  hashWithSalt,
  dbQuery,
  assertRequiredBodyParams,
} = require("./utils");

const verifyPassword = async (passwordHash, salt, passwordAttempt) => {
  const [pbkdf2, { hash }] = await Promise.all([
    getConfigurationFile("crypto.config.json"),
    hashWithSalt(passwordAttempt, salt),
  ]);

  return passwordHash === hash.toString(pbkdf2.byte_to_string_encoding);
};

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

    const { salt, hash, user_id, confirmed } = await getSaltAndHashForUser(
      username
    );

    if (!confirmed) {
      throw new Error(
        "Unauthorized. User not yet confirmed. Please check your email."
      );
    }

    const valid = await verifyPassword(hash, salt, passwordAttempt);

    if (!valid) {
      throw new Error("Unauthorized. Invalid username or password.");
    }

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
