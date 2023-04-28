/**
 * @fileoverview This module exports a Lambda function that generates an access
 * key and secret key for a user. It authenticates the user, retrieves their ID
 * from the token, and generates a new access key and secret key. The function
 * calculates the hash of the access key and secret key, inserts them into the
 * database, and sends a success response with the generated keys.
 */

"use strict";

const crypto = require("crypto");
const {
  assertBearerTokenOrBasicAuth,
  hashWithSalt,
  dbQuery,
} = require("./utils");

/**
 * Inserts the access key and its hash into the database.
 * @param {number} userId - The ID of the user.
 * @param {string} accessKey - The access key to be inserted.
 * @param {string} hash - The hash of the access key.
 * @returns {Promise} A promise that resolves when the access key is inserted.
 */
const insertAccessKey = async (userId, accessKey, hash) => {
  return dbQuery(
    `INSERT INTO client_access_keys (user_id, access_key, access_key_hash) VALUES (:userId, :accessKey, :hash)`,
    { userId, accessKey, hash }
  );
};

/**
 * AWS Lambda function handler for generating an access key and secret key.
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

    // Generate access key and secret access key
    const accessKey = crypto.randomBytes(10).toString("hex");
    const secretAccessKey = crypto.randomBytes(20).toString("hex");

    // Calculate the hash with salt
    const { hash } = await hashWithSalt(
      accessKey.toUpperCase(),
      secretAccessKey
    );

    // Insert the access key and hash into the database
    await insertAccessKey(user_id, accessKey.toUpperCase(), hash);

    // Send a success response with the generated keys
    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: `Here is your access key and secret key. It will be needed to interact with your datastores. Do NOT share this with anyone. If a key is compromised or lost, its your responsibility to delete it, you will need to regenerate a new access key and secret key`,
        access_key: accessKey.toUpperCase(),
        secret_access_key: secretAccessKey,
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
