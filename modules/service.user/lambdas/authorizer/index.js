"use strict";

/**
 * Custom authorizer that can accept either a bearer token or basic auth.
 * @param {Object} event - The event object passed to the function.
 * @param {Object} context - The context object passed to the function.
 * @param {function} callback - The callback function passed to the function.
 * @returns {void}
 */
exports.handler = async (event, context, callback) => {
  try {
    const decodedToken = await assertBearerTokenOrBasicAuth(
      event?.headers?.Authorization
    );

    callback(null, {
      principalId: `user|${decodedToken.user_id}`,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: event.methodArn,
          },
        ],
      },
    });
  } catch (error) {
    callback("Unauthorized");
  }
};
