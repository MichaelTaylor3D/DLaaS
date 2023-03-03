"use strict";

const { assertBearerTokenOrBasicAuth, dbQuery } = require("./utils");

const getAccessKeys = async (userId) => {
  return dbQuery(
    `SELECT access_key FROM client_access_keys WHERE user_id = :userId`,
    { userId }
  );
};

exports.handler = async (event, context, callback) => {
  try {
    const decodedToken = await assertBearerTokenOrBasicAuth(event?.headers?.Authorization);

    const { user_id } = decodedToken;

    const accessKeys = await getAccessKeys(user_id);

    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        access_keys: accessKeys.map((key) => key.access_key),
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
