/**
 * @fileoverview A Lambda function to handle file uploads to an S3 bucket via
 * an API Gateway. This function receives request parameters, and sends a
 * message to an SQS queue for further processing.
 */

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { getConfigurationFile } = require("./common");

/**
 * @typedef {Object} LambdaEvent
 * @property {string} body - The request body containing store_id, full_tree_filename, and diff_filename.
 */

/**
 * Lambda function handler for the /upload endpoint.
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
  const full_tree_filename = requestBody.full_tree_filename;
  const diff_filename = requestBody.diff_filename;

  // Send the message to the SQS queue
  const sqs = new AWS.SQS();
  const message = JSON.stringify({
    MessageGroupId: uuidv4(),
    requestId: uuidv4(),
    message: JSON.stringify({
      cmd: "UPLOAD_STORE_DATA_TO_S3",
      payload: { store_id, full_tree_filename, diff_filename },
    }),
  });

  const params = {
    QueueUrl: queueUrl,
    MessageBody: message,
  };

  try {
    await sqs.sendMessage(params).promise();

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
