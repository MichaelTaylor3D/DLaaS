/**
 * @fileoverview A Lambda function to handle missing files in an S3 bucket via
 * an API Gateway. This function receives the store_id and files from the
 * request body and sends a separate message to an SQS queue for each file.
 */

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { getConfigurationFile } = require("./common");

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
  // Retrieve SQS configuration
  const queueConfig = await getConfigurationFile("command-queue.config.json");
  const queueUrl = queueConfig.queue_url;

  // Parse the request parameters from the event body
  const requestBody = JSON.parse(event.body);
  const store_id = requestBody.store_id;
  const files = requestBody.files;

  // Create the SQS client
  const sqs = new AWS.SQS();

  // Send a separate message to the SQS queue for each file
  const promises = files.map(async (file) => {
    const message = JSON.stringify({
      MessageGroupId: uuidv4(),
      requestId: uuidv4(),
      message: JSON.stringify({
        cmd: "UPLOAD_MISSING_FILE_TO_S3",
        payload: { store_id, file },
      }),
    });

    const params = {
      QueueUrl: queueUrl,
      MessageBody: message,
    };

    return sqs.sendMessage(params).promise();
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
