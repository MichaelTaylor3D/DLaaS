/**
 * @fileoverview This module exports a Lambda function that handles user
 * registration events. It validates user input, checks for existing users with
 * the same username or email, and creates a new user in the database. It also
 * sends a confirmation email to the user with a link to activate their account.
 */

"use strict";

// Import required modules
const { passwordStrength } = require("check-password-strength");
const {
  hashWithSalt,
  generateSalt,
  sendEmail,
  generateConfirmationCode,
  getUserByEmailOrUsername,
  dbQuery,
  assertRequiredBodyParams,
  getConfigurationFile,
} = require("./common");


/**
 * Inserts a new user into the database.
 * @async
 * @param {string} username - The user's username.
 * @param {string} email - The user's email.
 * @param {string} passwordHash - The hashed user password.
 * @param {string} salt - The salt used for hashing the password.
 * @param {string} confirmationCode - The confirmation code for account activation.
 * @returns {Promise} A promise that resolves when the user is inserted into the database.
 */
const insertUserIntoDb = async (
  username,
  email,
  passwordHash,
  salt,
  confirmationCode
) => {
  return dbQuery(
    `CALL create_new_user(:username, :email, :passwordHash, :salt, :confirmationCode)`,
    {
      username,
      email,
      passwordHash,
      salt,
      confirmationCode,
      createdAt: Date.now(),
    }
  );
};

/**
 * Handles the user registration event.
 * @async
 * @param {Object} event - The AWS Lambda event object.
 * @param {Object} context - The AWS Lambda context object.
 * @param {Function} callback - The AWS Lambda callback function.
 */
exports.handler = async (event, context, callback) => {
  try {
    // Parse and validate required body parameters
    const requestBody = JSON.parse(event.body);
    const { username, email, password } = await assertRequiredBodyParams(
      requestBody,
      ["username", "email", "password"]
    );

    // Check password strength
    if (passwordStrength(password).value !== "Strong") {
      throw new Error(
        "Password is not strong enough. Min Length: 10, Requires 1 of each of the following: ['lowercase', 'uppercase', 'symbol', 'number']"
      );
    }

    // Check for existing users with the same username or email
    const existingUser = await getUserByEmailOrUsername(email, username);

    if (existingUser?.username === username) {
      throw new Error("Username already exists.");
    }

    if (existingUser?.email === email) {
      throw new Error("Email already exists.");
    }

    // Create a new user in the database
    const salt = await generateSalt();
    const { hash } = await hashWithSalt(password, salt);
    const confirmationCode = generateConfirmationCode();

    await insertUserIntoDb(username, email, hash, salt, confirmationCode);

    const appConfig = await getConfigurationFile("app.config.json");

    // Send confirmation email
    await sendEmail(
      email,
      "DataLayer Storage Account Creation",
      `Your account has been created successfully. Go to the following link to activate your account. https://app.${appConfig.SERVICE_DOMAIN}/user/v1/confirm?code=${confirmationCode}`,
      `<div>Your account has been created successfully. Click on the link below to activate your account.</div><a href='https://app.${appConfig.SERVICE_DOMAIN}/user/v1/confirm?code=${confirmationCode}'>Activate Account</a>`
    );

    // Send a success response
    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message:
          "User created successfully, Check your email for the confirmation code.",
      }),
    });
  } catch (error) {
    // Handle errors and send an error response
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: error.message,
      }),
    });
  }
};
