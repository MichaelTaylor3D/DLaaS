/**
 * @fileoverview Lambda function for creating a subscription using the provided productKey.
 */

const { checkForPayment } = require("./common");
const config = require('./common/config.json');

/**
 * Handles the subscription creation event.
 * @async
 * @param {Object} event - The AWS Lambda event object.
 * @param {Object} context - The AWS Lambda context object.
 * @param {Function} callback - The AWS Lambda callback function.
 * @returns {void}
 */
exports.handler = async (event, context, callback) => {
  try {
    // Get the invoiceId from the path parameters
    const { invoiceId } = event.pathParameters;

    // Call the checkForPayment function with the invoiceId
    checkForPayment(invoiceId);

    // Send a success response with the invoice ID
    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": `https://${config.SERVICE_DOMAIN}, https://app.${config.SERVICE_DOMAIN}`,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
      },
      body: JSON.stringify({
        message: "Checked for payment successfully.",
        invoice_id: invoiceId,
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
