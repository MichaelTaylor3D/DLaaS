/**
 * @fileoverview This module exports a Lambda function that handles deleting an
 * access key for a user. It authenticates the user, retrieves their ID from the
 * token, and deletes the specified access key. The function sends a success
 * response upon successful deletion of the access key.
 */

"use strict";

const { assertBearerTokenOrBasicAuth, dbQuery } = require("./utils");

/**
 * Deletes the access key for the specified user.
 * @param {number} userId - The ID of the user.
 * @param {string} accessKey - The access key to be deleted.
 * @returns {Promise} A promise that resolves when the access key is deleted.
 */
const deleteAccessKey = async (userId, accessKey) => {
  return dbQuery(
    `DELETE FROM client_access_keys WHERE user_id = :userId AND access_key = :accessKey`,
    { userId, accessKey }
  );
};

/**
 * AWS Lambda function handler for deleting an access key.
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
    const accessKey = event.pathParameters.accessKey;

    // Delete the specified access key for the user
    await deleteAccessKey(user_id, accessKey);

    // Send a success response
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: `${accessKey} has been deleted and is no longer usable.`,
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
