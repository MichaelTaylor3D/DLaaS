/**
 * @fileoverview A Lambda function to handle creating a folder in an S3 bucket
 * for a store via an API Gateway. This function receives the store_id from
 * the request body and creates a folder with the specified path.
 */

const AWS = require("aws-sdk");
const config = require("./common/config.json");

/**
 * @typedef {Object} LambdaEvent
 * @property {string} body - The request body containing store_id.
 */

/**
 * Lambda function handler for the /handle_upload endpoint.
 * @param {LambdaEvent} event - The request parameters from API Gateway.
 * @param {Object} context - The context object for the Lambda function.
 * @param {Function} callback - The callback function for API Gateway.
 */
exports.handler = async (event, context, callback) => {
  // Parse the request parameters from the event body
  const requestBody = JSON.parse(event.body);
  const store_id = requestBody.store_id;

  // Create the S3 client
  const s3 = new AWS.S3();
  const Bucket = config.DEFAULT_S3_BUCKET;
  const folderKey = `public/${store_id}/`;

  // Create an empty object to emulate a folder
  const params = {
    Bucket,
    Key: folderKey,
    ACL: "public-read",
    Body: "",
  };

  try {
    await s3.putObject(params).promise();

    // Invoke the callback function with a successful response
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ handle_upload: true }),
    });
  } catch (error) {
    console.error(error);

    // Invoke the callback function with an error response
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({ handle_upload: false }),
    });
  }
};
