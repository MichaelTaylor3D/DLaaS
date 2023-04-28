/**
 * @fileoverview This module exports a Lambda function that handles canceling
 * email change requests. It retrieves the user object associated with the
 * provided email change code, deletes the pendingEmail and changeEmailCode
 * metadata for the user, and sends a response with the status of the operation.
 */

"use strict";

// Import utility functions
const { dbQuery, deleteUserMeta } = require("./utils");

/**
 * Retrieves a user object by their email change code.
 * @async
 * @param {string} code - The email change code.
 * @returns {Promise<Object>} The user object if found, otherwise undefined.
 */
const getUserByEmailChangeCode = async (code) => {
  // Perform database query to find user with matching code
  const results = await dbQuery(
    `
    SELECT * FROM users 
    INNER JOIN user_meta ON users.id = user_meta.user_id
    WHERE user_meta.meta_value = :code
  `,
    { code }
  );

  // Return the first user found (or undefined if no user is found)
  return results?.[0];
};

/**
 * Handles the cancel email change request event.
 * @async
 * @param {Object} event - The AWS Lambda event object.
 * @param {Object} context - The AWS Lambda context object.
 * @param {Function} callback - The AWS Lambda callback function.
 */
exports.handler = async (event, context, callback) => {
  try {
    // Extract the code from the query string parameters
    const code = event?.queryStringParameters?.code;

    // Get the user associated with the email change code
    const user = await getUserByEmailChangeCode(code);

    // Delete the pendingEmail and changeEmailCode metadata for the user
    await Promise.all([
      deleteUserMeta(user.user_id, "pendingEmail"),
      deleteUserMeta(user.user_id, "changeEmailCode"),
    ]);

    // Send a success response
    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: `User email change request has been cancelled. Contact the Admin if you suspect anything suspicious.`,
      }),
    });
  } catch (error) {
    // Send an error response
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: error.message,
      }),
    });
  }
};
