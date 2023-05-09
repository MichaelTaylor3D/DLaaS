const { sendChiaRPCCommand } = require("/opt/nodejs/common");
const rpc = require("/opt/nodejs/common/rpc.json");

/**
 * @typedef {Object} LambdaEvent
 * @property {string} body - The request body containing store_id and files.
 */

/**
 * Lambda function handler for the /cron_add_missing_files operation.
 * @param {LambdaEvent} event - The request parameters.
 * @param {Object} context - The context object for the Lambda function.
 * @returns {Promise<Object>} The response object.
 */
exports.handler = async (event, context) => {
  try {
    await sendChiaRPCCommand(rpc.ADD_MISSING_FILES);

    // Return a successful response
    return {
      statusCode: 200,
      body: JSON.stringify({ uploaded: true }),
    };
  } catch (error) {
    console.error(error);

    // Return an error response
    return {
      statusCode: 500,
      body: JSON.stringify({ uploaded: false }),
    };
  }
};
