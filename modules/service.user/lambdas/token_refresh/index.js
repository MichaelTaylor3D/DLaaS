"use strict";

const jwt = require("jsonwebtoken");
const { getConfigurationFile } = require("/opt/nodejs/common");

/**
 * Generates a new access token for the user.
 * @param {string} username - The user's username.
 * @param {number} user_id - The user's id.
 * @returns {Promise<string>} - The access token.
 */
const generateAccessToken = async (username, user_id) => {
  const config = await getConfigurationFile("crypto.config.json");
  return jwt.sign(
    {
      user_id,
      username,
    },
    config.token_secret,
    { expiresIn: "1h" }
  );
};

/**
 * Generates a new refresh token for the user.
 * @param {string} username - The user's username.
 * @param {number} user_id - The user's id.
 * @returns {Promise<string>} - The refresh token.
 */
const generateRefreshToken = async (username, user_id) => {
  const config = await getConfigurationFile("crypto.config.json");
  return jwt.sign(
    {
      user_id,
      username,
    },
    config.refresh_token_secret,
    { expiresIn: "7d" }
  );
};

exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { refresh_token } = requestBody;

    if (!refresh_token) {
      throw new Error("Refresh token is required.");
    }

    // Verify the old refresh token
    const config = await getConfigurationFile("crypto.config.json");
    const decoded = jwt.verify(refresh_token, config.refresh_token_secret);

    // Get user information from the refresh token payload
    const { username, user_id } = decoded;

    // Generate a new access token and refresh token for the user
    const [accessToken, newRefreshToken] = await Promise.all([
      generateAccessToken(username, user_id),
      generateRefreshToken(username, user_id),
    ]);

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        access_token: accessToken,
        refresh_token: newRefreshToken,
      }),
    });
  } catch (error) {
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: error.message,
      }),
    });
  }
};
