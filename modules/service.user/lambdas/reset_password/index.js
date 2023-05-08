/**
 * @fileoverview This module exports a Lambda function that handles reset password
 * requests. It generates a reset password code, saves it to the user's metadata,
 * and sends the code to the user's email address. The function sends a success
 * response or an error response if the reset password request fails.
 */

"use strict";

const {
  upsertUserMeta,
  sendEmail,
  generateConfirmationCode,
  assertBearerTokenOrBasicAuth,
  assertRequiredBodyParams,
  getUserBy,
} = require("/opt/nodejs/common");

/**
 * AWS Lambda function handler that generates a reset password code and sends it to the user's email address.
 *
 * @async
 * @function
 * @param {Object} event - AWS Lambda event object
 * @param {Object} context - AWS Lambda context object
 * @param {Function} callback - AWS Lambda callback function
 */
exports.handler = async (event, context, callback) => {
  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);

    // Validate the token or authorization header
    const decodedToken = await assertBearerTokenOrBasicAuth(
      event?.headers?.Authorization
    );

    // Ensure that the email field is present in the request body
    const { email } = await assertRequiredBodyParams(requestBody, ["email"]);

    // Retrieve the user by their user ID
    const existingUser = await getUserBy("id", decodedToken.user_id);

    if (existingUser) {
      // Generate a reset password code
      const resetPasswordCode = generateConfirmationCode();

      // Save the reset password code to the user's metadata
      await upsertUserMeta(
        existingUser.id,
        "resetPasswordCode",
        resetPasswordCode
      );

      // Send the reset password code to the user's email
      await sendEmail(
        email,
        "DataLayer Storage Reset Email Request",
        `Your reset password code is: ${resetPasswordCode}.`,
        `<div>Your reset password code is:</div><div>${resetPasswordCode}</div>`
      );
    }

    // Send a success response
    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message:
          "If your email was in the system, A reset password code has been emailed to you.",
      }),
    });
  } catch (error) {
    // Handle errors by sending an error response
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: error.message,
      }),
    });
  }
};
