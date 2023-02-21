const _ = require("lodash");
const mysql = require("mysql");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { getConfigurationFile } = require("./utils");

const hashSecretAccessKey = async (accessKey, secretAccessKey) => {
  const { pbkdf2 } = await getConfigurationFile("api.config.json");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      accessKey,
      secretAccessKey,
      pbkdf2.iterations,
      pbkdf2.password_length,
      pbkdf2.digest,
      (error, hash) => {
        if (error) {
          return reject(error);
        }

        resolve({
          accessKey,
          hash: hash.toString(pbkdf2.byte_to_string_encoding),
        });
      }
    );
  });
};

const verifyToken = async (token) => {
  const apiConfig = await getConfigurationFile("api.config.json");
  return new Promise((resolve, reject) => {
    jwt.verify(token, apiConfig.token_secret, (err, decoded) => {
      if (err) {
        reject(err);
      }

      resolve(decoded);
    });
  });
};

const insertAccessKey = async (userId, accessKey, hash) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(
      /\:(\w+)/g,
      function (txt, key) {
        if (values.hasOwnProperty(key)) {
          return this.escape(values[key]);
        }
        return txt;
      }.bind(this)
    );
  };

  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO client_access_keys (user_id, access_key, hash) VALUES (:userId, :accessKey, :secretAccessKey)`;

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
    const bearerToken = event?.headers?.authorization.split(" ")[1];
    if (!bearerToken) {
      throw new Error("Missing bearer token");
    }

    const decodedToken = await verifyToken(bearerToken);
    const { user_id } = decodedToken;

    const accessKey = crypto.randomBytes(10).toString("hex");
    const secretAccessKey = crypto.randomBytes(20).toString("hex");

    const { hash } = await hashSecretAccessKey(accessKey, secretAccessKey);

    await insertAccessKey(user_id, accessKey, hash);

    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message:
          "Here is your access key and secret key, if you loose your secret key, you will need to regenerate a new access key and secret key.",
        access_key: accessKey,
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
