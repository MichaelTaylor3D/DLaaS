/**
 * @fileoverview A Lambda function to handle missing files in an S3 bucket via
 * an API Gateway. This function receives the store_id and files from the
 * request body and sends a separate message to an SQS queue for each file.
 */

const { sendChiaRPCCommand } = require("./common");
const rpc = require("./common/rpc.json");

/**
 * @typedef {Object} LambdaEvent
 * @property {string} body - The request body containing store_id and files.
 */

/**
 * Lambda function handler for the /handle_missing_files endpoint.
 * @param {LambdaEvent} event - The request parameters from API Gateway.
 * @param {Object} context - The context object for the Lambda function.
 * @param {Function} callback - The callback function for API Gateway.
 */
exports.handler = async (event, context, callback) => {
  // Parse the request parameters from the event body
  const requestBody = JSON.parse(event.body);
  const store_id = requestBody.store_id;
  const files = requestBody.files;

  // Send a separate message to the SQS queue for each file
  const promises = files.map(async (file) => {
    return sendChiaRPCCommand(rpc.UPLOAD_FILE_TO_S3, { store_id, file });
  });

  try {
    await Promise.all(promises);

    // Invoke the callback function with a successful response
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ uploaded: true }),
    });
  } catch (error) {
    console.error(error);

    // Invoke the callback function with an error response
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({ uploaded: false }),
    });
  }
};
