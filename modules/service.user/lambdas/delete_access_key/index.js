"use strict";

const {
  verifyToken,
  dbQuery,
} = require("./utils");

const deleteAccessKey = async (userId, accessKey) => {
  return dbQuery(
    `DELETE FROM client_access_keys WHERE user_id = :userId AND access_key = :accessKey`,
    { userId, accessKey }
  );
};

exports.handler = async (event, context, callback) => {
  try {
    const auth = event?.headers?.Authorization.split(" ");
    if (auth?.[0].toLowerCase() !== "bearer") {
      throw new Error("Missing bearer token");
    }

    const bearerToken = auth[1];

    const decodedToken = await verifyToken(bearerToken);
    const { user_id } = decodedToken;
    const accessKey = event.pathParameters.accessKey;

    await deleteAccessKey(user_id, accessKey);

    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: `${accessKey} has been deleted and is no longer usable.`,
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
