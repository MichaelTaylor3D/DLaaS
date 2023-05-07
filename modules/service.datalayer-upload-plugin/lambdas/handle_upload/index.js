/**
 * @typedef {Object} LambdaEvent
 * @property {string} body - The request body containing store_id.
 */

/**
 * Dummy response so the plugin works
 * @param {LambdaEvent} event - The request parameters from API Gateway.
 * @param {Object} context - The context object for the Lambda function.
 * @param {Function} callback - The callback function for API Gateway.
 */
exports.handler = async (event, context, callback) => {
  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ handle_upload: true }),
  });
};
