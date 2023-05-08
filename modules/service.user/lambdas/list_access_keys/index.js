/**
 * @fileoverview This module exports a Lambda function that retrieves the access
 * keys of a user. It authenticates the user, retrieves their ID from the token,
 * and fetches the access keys associated with the user ID. The function sends
 * a success response with the access keys.
 */

"use strict";

const { assertBearerTokenOrBasicAuth, dbQuery } = require("/opt/nodejs/common");

/**
 * Retrieves the access keys associated with the given user ID.
 * @param {number} userId - The ID of the user.
 * @returns {Promise} A promise that resolves with the access keys.
 */
const getAccessKeys = async (userId) => {
  return dbQuery(
    `SELECT access_key FROM client_access_keys WHERE user_id = :userId`,
    { userId }
  );
};

/**
 * AWS Lambda function handler for getting the access keys of a user.
 * @async
 * @param {Object} event - AWS Lambda event object.
 * @param {Object} context - AWS Lambda context object.
 * @param {Function} callback - AWS Lambda callback function.
 */
exports.handler = async (event, context, callback) => {
  try {
    // Authenticate the user and retrieve their ID from the token
    const decodedToken = await assertBearerTokenOrBasicAuth(
      event?.headers?.Authorization
    );

    const { user_id } = decodedToken;

    // Retrieve the access keys associated with the user ID
    const accessKeys = await getAccessKeys(user_id);

    // Send a success response with the access keys
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        access_keys: accessKeys.map((key) => key.access_key),
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
