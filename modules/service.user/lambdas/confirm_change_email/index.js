"use strict";

// Import utility functions
const { dbQuery, getUserMeta, deleteUserMeta } = require("./utils");

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
 * Handles the confirm email change event.
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

    // Get the pending email for the user
    const pendingEmail = await getUserMeta(user.user_id, "pendingEmail");

    // Perform necessary actions to confirm the email change
    await Promise.all([
      // Update the user's email in the database
      dbQuery("UPDATE users SET email = :pendingEmail WHERE id = :userId", {
        pendingEmail,
        userId: user.user_id,
      }),

      // Delete the pendingEmail and changeEmailCode metadata for the user
      deleteUserMeta(user.user_id, "pendingEmail"),
      deleteUserMeta(user.user_id, "changeEmailCode"),
    ]);

    // Send a success response
    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: `User email has been changed to ${pendingEmail}.`,
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
