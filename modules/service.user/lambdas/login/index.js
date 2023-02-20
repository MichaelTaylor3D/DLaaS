const _ = require("lodash");
const mysql = require("mysql");
const crypto = require("crypto");
const pbkdf2 = require("pbkdf2");
const jwt = require("jsonwebtoken");
const { getConfigurationFile } = require("./utils");

function isPasswordCorrect(
  savedHash,
  savedSalt,
  savedIterations,
  passwordAttempt
) {
  return savedHash == pbkdf2(passwordAttempt, savedSalt, savedIterations);
}

const generateAccessToken = async (username) => {
  const apiConfig = await getConfigurationFile("api.config.json");
  return jwt.sign(username, apiConfig.token_secret, {
    expiresIn: "2592000s",
  });
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
      SELECT meta.user_id, meta.meta_value, users.password_hash
      FROM meta
      INNER JOIN users on users.id = meta.user_id
      WHERE meta_key = 'salt'
      AND users.username = ':username';
    `;

    const params = { salt };

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
    const sql = `CALL insert_jwt(:jwt, :user_id)`;

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
  const { salt, hash, user_id } = getSaltAndHashForUser(username);

  if (!isPasswordCorrect(hash, salt, 10000, passwordAttempt)) {
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: "Unauthorized.",
      }),
    });
    return;
  }

  const accessToken = await generateAccessToken(username);
  await insertJWT(accessToken, user_id);

  callback(null, {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      access_token: jwt,
    }),
  });
};
