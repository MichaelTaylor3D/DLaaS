/**
 * @fileoverview A Lambda function to handle missing files in an S3 bucket via
 * an API Gateway. This function receives the store_id and files from the
 * request body and sends a separate message to an SQS queue for each file.
 */

const { sendChiaRPCCommand, dbQuery } = require("/opt/nodejs/common");
const rpc = require("/opt/nodejs/common/rpc.json");

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
  try {
    const { store_id, files } = JSON.parse(event.body);

    const chiaRPCPromises = files.map((file) =>
      sendChiaRPCCommand(rpc.UPLOAD_FILE_TO_S3, { store_id, file })
    );

    Promise.all(chiaRPCPromises);

    callback(null, {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ uploaded: true }),
    });
  } catch (error) {
    console.error(error);

    callback(null, {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ uploaded: false }),
    });
  }
};
