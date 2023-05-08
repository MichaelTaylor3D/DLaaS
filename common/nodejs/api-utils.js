const cryptoUtils = require("./crypto-utils");
const dbUtils = require("./database-utils");

/**
 * Verifies the authorization header and checks for bearer token or basic auth.
 * @async
 * @function
 * @param {string} authHeader - The Authorization header from the request.
 * @returns {Promise<Object>} - A promise that resolves with the user ID if the authorization is valid.
 * @throws {Error} If the authorization header is invalid or missing.
 */
const assertBearerTokenOrBasicAuth = async (authHeader) => {
  const auth = authHeader.split(" ");
  if (!["bearer", "basic"].includes(auth?.[0]?.toLowerCase())) {
    throw new Error("Missing bearer or token or client credentials");
  }

  // Check for bearer token
  if (auth?.[0]?.toLowerCase() === "bearer") {
    const bearerToken = auth[1];
    return await cryptoUtils.verifyToken(bearerToken);
  }

  // Check for basic auth
  if (auth?.[0]?.toLowerCase() === "basic") {
    const [accessKey, secretAccessKey] = Buffer.from(auth[1], "base64")
      .toString("utf-8")
      .split(":");

    const { hash } = await cryptoUtils.hashWithSalt(accessKey, secretAccessKey);

    const [saveHashResult] = await dbUtils.getSaveHashForAccessKey(accessKey);

    if (saveHashResult.access_key_hash !== hash) {
      throw new Error("Invalid access key.");
    }

    return { user_id: saveHashResult.user_id };
  }
};

/**
 * Asserts that the required body parameters are present.
 * @function
 * @param {Object} body - The request body.
 * @param {Array<string>} required - The list of required parameters.
 * @returns {Promise<Object>} - A promise that resolves with the request body if all required parameters are present.
 * @throws {Error} If a required parameter is missing.
 */
const assertRequiredBodyParams = (body, required) => {
  required.forEach((param) => {
    if (!body[param]) {
      throw new Error(`${param} is required`);
    }
  });

  return Promise.resolve(body);
};

module.exports = {
  assertBearerTokenOrBasicAuth,
  assertRequiredBodyParams,
};
