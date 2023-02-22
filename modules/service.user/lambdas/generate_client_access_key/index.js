const _ = require("lodash");
const mysql = require("mysql");
const crypto = require("crypto");
const {
  getConfigurationFile,
  verifyToken,
  queryFormat,
  hashWithSalt,
} = require("./utils");

const insertAccessKey = async (userId, accessKey, hash) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = queryFormat;

  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO client_access_keys (user_id, access_key, access_key_hash) VALUES (:userId, :accessKey, :hash)`;

    const params = { userId, accessKey, hash };

    connection.query(sql, params, (error) => {
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      connection.end();
      resolve();
    });
  });
};

exports.handler = async (event, context, callback) => {
  try {
    const bearerToken = event?.headers?.Authorization.split(" ")[1];
    if (!bearerToken) {
      throw new Error("Missing bearer token");
    }

    const decodedToken = await verifyToken(bearerToken);
    const { user_id } = decodedToken;

    const accessKey = crypto.randomBytes(10).toString("hex");
    const secretAccessKey = crypto.randomBytes(20).toString("hex");

    const { hash } = await hashWithSalt(
      accessKey.toUpperCase(),
      secretAccessKey
    );

    await insertAccessKey(user_id, accessKey.toUpperCase(), hash);

    callback(null, {
      statusCode: 400,
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
