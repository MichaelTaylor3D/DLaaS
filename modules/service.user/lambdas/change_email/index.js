/**
 * @fileoverview This module exports a Lambda function that handles email change
 * requests. It processes the email change request, generates an email change
 * confirmation code, upserts user metadata, and sends emails to the old and new
 * email addresses to confirm or cancel the email change request.
 */

"use strict";

// Import utility functions
const {
  upsertUserMeta,
  getUserBy,
  sendEmail,
  sendEmailByTemplate,
  generateConfirmationCode,
  assertBearerTokenOrBasicAuth,
  assertRequiredBodyParams,
} = require("/opt/nodejs/common");

const config = require("/opt/nodejs/common/config.json");

/**
 * Handles the email change request event.
 * @async
 * @param {Object} event - The AWS Lambda event object.
 * @param {Object} context - The AWS Lambda context object.
 * @param {Function} callback - The AWS Lambda callback function.
 */
exports.handler = async (event, context, callback) => {
  try {
    // Authenticate the user and get their user ID from the token
    const decodedToken = await assertBearerTokenOrBasicAuth(
      event?.headers?.Authorization
    );
    const { user_id } = decodedToken;

    // Parse the request body and extract the email
    const requestBody = JSON.parse(event.body);
    const { email } = await assertRequiredBodyParams(requestBody, ["email"]);

    // Get the user object by user ID
    const user = await getUserBy("id", user_id);

    // Generate an email change confirmation code
    const changeEmailCode = generateConfirmationCode();

    // Perform necessary actions to process the email change request
    await Promise.all([
      // Upsert user meta for change email code and pending email
      upsertUserMeta(user_id, "changeEmailCode", changeEmailCode),
      upsertUserMeta(user_id, "pendingEmail", email),

      // Send an email to the old email address to cancel the change
      sendEmailByTemplate({
        email: user.email,
        subject: `${config.SERVICE_NAME} Email Change`,
        template: "email-change-confirm.handlebars",
        values: {
          serviceName: config.SERVICE_NAME,
          email,
          domain: config.SERVICE_DOMAIN,
          changeEmailCode,
        },
      }),
      // Send an email to the new email address to confirm the change
      sendEmailByTemplate({
        email,
        subject: `${config.SERVICE_NAME} Email Change`,
        template: "email-change-request.handlebars",
        values: {
          serviceName: config.SERVICE_NAME,
          domain: config.SERVICE_DOMAIN,
          changeEmailCode,
        }
      })
    ]);

    // Send a success response
    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: "Email change request processed. Check you email to confirm.",
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
