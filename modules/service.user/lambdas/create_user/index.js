const _ = require("lodash");
const mysql = require("mysql");
const crypto = require("crypto");
const pbkdf2 = require("pbkdf2");
const jwt = require("jsonwebtoken");
const { getConfigurationFile } = require("./utils");

const PASSWORD_LENGTH = 256;
const ITERATIONS = 10000;
const DIGEST = "sha256";
const BYTE_TO_STRING_ENCODING = "base64"; // this could be base64, for instance

const verifyPassword = (passwordHash, salt, passwordAttempt) => {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      passwordAttempt,
      salt,
      ITERATIONS,
      PASSWORD_LENGTH,
      DIGEST,
      (error, hash) => {
        if (error) {
          return reject(error);
        }

        resolve(passwordHash === hash.toString(BYTE_TO_STRING_ENCODING));
      }
    );
  });
};

const generateAccessToken = async (username, user_id) => {
  const apiConfig = await getConfigurationFile("api.config.json");
  return jwt.sign(
    {
      user_id,
      username,
    },
    apiConfig.token_secret,
    { expiresIn: "720h" }
  );
};

const getSaltAndHashForUser = async (username) => {
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
    const sql = `
      SELECT salt, id as user_id, password_hash as hash
      FROM users
      WHERE username = :username;
    `;

    const params = { username };

    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      connection.end();
      resolve(results[0]);
    });
  });
};

const insertJWT = async (jwt, user_id) => {
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
    const sql = `CALL insert_jwt(:jwt, :user_id, )`;

    const params = { jwt, user_id };

    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      connection.end();
      resolve(results[0]);
    });
  });
};

exports.handler = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const username = _.get(requestBody, "username");
  const passwordAttempt = _.get(requestBody, "password");
  const { salt, hash, user_id } = await getSaltAndHashForUser(username);

  const valid = await verifyPassword(hash, salt, passwordAttempt);

  if (!valid) {
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: "Unauthorized.",
      }),
    });
    return;
  }

  const accessToken = await generateAccessToken(username, user_id);

  callback(null, {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ accessToken }),
  });
};
