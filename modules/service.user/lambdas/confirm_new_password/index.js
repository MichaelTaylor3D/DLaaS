/**
 * @fileoverview This module exports a Lambda function that handles password
 * reset events. It checks the password strength, validates the reset code,
 * resets the password, and sends a confirmation email to the user. The function
 * sends a response with the status of the operation.
 */

"use strict";

// Import required modules
const { passwordStrength } = require("check-password-strength");
const {
  generateSalt,
  sendEmail,
  dbQuery,
  hashWithSalt,
  upsertUserMeta,
  assertRequiredBodyParams,
} = require("/opt/nodejs/common");

/**
 * Retrieves a user object by their password reset code.
 * @async
 * @param {string} resetCode - The password reset code.
 * @returns {Promise<Object>} The user object if found, otherwise undefined.
 */
const getUserByResetCode = async (resetCode) => {
  const results = await dbQuery(
    `
    SELECT * FROM users 
    INNER JOIN user_meta ON users.id = user_meta.user_id
    WHERE user_meta.meta_value = :resetCode
  `,
    { resetCode }
  );

  return results?.[0];
};

/**
 * Deletes user_meta entry with the given reset code.
 * @async
 * @param {string} resetCode - The password reset code.
 * @returns {Promise}
 */
const deleteUserMeta = async (resetCode) => {
  return dbQuery(`DELETE FROM user_meta WHERE meta_value = :resetCode`, {
    resetCode,
  });
};

/**
 * Resets the user's password.
 * @async
 * @param {string} newPassword - The new password.
 * @param {number} userId - The user ID.
 * @returns {Promise}
 */
const resetPassword = async (newPassword, userId) => {
  const salt = await generateSalt();
  const { hash } = await hashWithSalt(newPassword, salt);

  return Promise.all([
    dbQuery(`UPDATE users SET password_hash = :hash WHERE id = :userId`, {
      hash,
      userId,
    }),
    upsertUserMeta(userId, "salt", salt),
  ]);
};

/**
 * Handles the password reset event.
 * @async
 * @param {Object} event - The AWS Lambda event object.
 * @param {Object} context - The AWS Lambda context object.
 * @param {Function} callback - The AWS Lambda callback function.
 */
exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { password, code } = await assertRequiredBodyParams(requestBody, [
      "password",
      "code",
    ]);

    // Check if the password is strong enough
    if (passwordStrength(password).value !== "Strong") {
      throw new Error(
        "Password is not strong enough. Min Legnth: 10, Requires 1 of each of the following: ['lowercase', 'uppercase', 'symbol', 'number']"
      );
    }

    // Get the user associated with the reset code
    const existingUser = await getUserByResetCode(code);

    // If the code is valid, reset the password
    if (existingUser) {
      await deleteUserMeta(code);
      await resetPassword(password, existingUser.user_id);

      // Send a confirmation email to the user
      await sendEmail(
        existingUser.email,
        "DataLayer Storage Reset Password Confirmation",
        `The password on your account has changed. If you did not request this change, please contact the administrator immediately.`
      );
    }

    // Send a success response
    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message:
          "If your reset password code was valid, Your password has now been changed. A confirmation email has been sent to you.",
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
