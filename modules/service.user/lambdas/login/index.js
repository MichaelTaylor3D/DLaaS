const _ = require("lodash");
const mysql = require("mysql");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { getConfigurationFile } = require("./utils");

const verifyPassword = async (passwordHash, salt, passwordAttempt) => {
  const { pbkdf2 } = await getConfigurationFile("api.config.json");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      passwordAttempt,
      salt,
      pbkdf2.iterations,
      pbkdf2.password_length,
      pbkdf2.digest,
      (error, hash) => {
        if (error) {
          return reject(error);
        }

        resolve(passwordHash === hash.toString(pbkdf2.byte_to_string_encoding));
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
    { expiresIn: "1h" }
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
      SELECT 
        user_meta.meta_value as salt, 
        users.id as user_id, 
        users.password_hash as hash, 
        users.confirmed as confirmed
      FROM users
      INNER JOIN user_meta on users.id = user_meta.user_id
      WHERE users.username = :username
      AND user_meta.meta_key = 'salt';
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

exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const username = _.get(requestBody, "username");
    const passwordAttempt = _.get(requestBody, "password");
    const { salt, hash, user_id, confirmed } = await getSaltAndHashForUser(
      username
    );

    if (!confirmed) {
      throw new Error(
        "Unauthorized. User not yet confirmed. Please check your email."
      );
    }

    const valid = await verifyPassword(hash, salt, passwordAttempt);

    if (!valid) {
      throw new Error("Unauthorized. Invalid username or password.");
    }

    const accessToken = await generateAccessToken(username, user_id);

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ access_token: accessToken }),
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
