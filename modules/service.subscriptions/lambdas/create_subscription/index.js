/**
 * @fileoverview Lambda function for creating a subscription using the provided productKey.
 */

const {
  assertBearerTokenOrBasicAuth,
  assertRequiredBodyParams,
  createSubscription,
} = require("./common");

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
    // Authenticate the user and retrieve their ID from the token
    const decodedToken = await assertBearerTokenOrBasicAuth(
      event?.headers?.Authorization
    );
    const { user_id } = decodedToken;

    // Parse the request body and assert the presence of the productKey
    const requestBody = JSON.parse(event.body);
    const { productKey, data } = await assertRequiredBodyParams(requestBody, [
      "productKey",
    ]);

    // Create a subscription for the user
    const subscriptionId = await createSubscription(user_id, productKey, data);

    // Send a success response with the subscription ID
    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: "Subscription created successfully.",
        subscription_id: subscriptionId,
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
