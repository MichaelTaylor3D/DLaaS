/**
 * @fileoverview This module exports a Lambda function that handles account
 * confirmation events. It confirms the user's account using the provided
 * confirmation code and sends a response with the status of the operation.
 */

"use strict";

// Import required modules
const { dbQuery } = require("/opt/nodejs/common");

/**
 * Confirms a user's account using the given confirmation code.
 * @async
 * @param {string} confirmationCode - The account confirmation code.
 * @returns {Promise} A promise that resolves when the account is confirmed.
 */
const confirmAccount = async (confirmationCode) => {
  return dbQuery("CALL confirm_account(:confirmationCode)", {
    confirmationCode,
  });
};

/**
 * Handles the account confirmation event.
 * @async
 * @param {Object} event - The AWS Lambda event object.
 * @param {Object} context - The AWS Lambda context object.
 * @param {Function} callback - The AWS Lambda callback function.
 */
exports.handler = async (event, context, callback) => {
  try {
    // Get the confirmation code from the query string parameters
    const confirmationCode = event?.queryStringParameters?.code;

    // Confirm the account using the provided confirmation code
    await confirmAccount(confirmationCode);

    // Send a success response
    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: "User confirmed you may now login.",
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
