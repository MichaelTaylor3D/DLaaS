"use strict";

const crypto = require("crypto");
const {
  assertBearerTokenOrBasicAuth,
  hashWithSalt,
  dbQuery,
} = require("./utils");

const insertAccessKey = async (userId, accessKey, hash) => {
  return dbQuery(
    `INSERT INTO client_access_keys (user_id, access_key, access_key_hash) VALUES (:userId, :accessKey, :hash)`,
    { userId, accessKey, hash }
  );
};

exports.handler = async (event, context, callback) => {
  try {
    const decodedToken = await assertBearerTokenOrBasicAuth(
      event?.headers?.Authorization
    );

    const { user_id } = decodedToken;

    const accessKey = crypto.randomBytes(10).toString("hex");
    const secretAccessKey = crypto.randomBytes(20).toString("hex");

    const { hash } = await hashWithSalt(
      accessKey.toUpperCase(),
      secretAccessKey
    );

    await insertAccessKey(user_id, accessKey.toUpperCase(), hash);

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: `Here is your access key and secret key. It will be needed to interact with your datastores. Do NOT share this with anyone. If a key is compromised or lost, its your responsibility to delete it, you will need to regenerate a new access key and secret key`,
        access_key: accessKey.toUpperCase(),
        secret_access_key: secretAccessKey,
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
