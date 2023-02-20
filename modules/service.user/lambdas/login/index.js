const _ = require("lodash");
const AWS = require("aws-sdk");
const mysql = require("mysql");
const crypto = require("crypto");
const pbkdf2 = require("pbkdf2");
import SES from "aws-sdk/clients/ses";

function isPasswordCorrect(
  savedHash,
  savedSalt,
  savedIterations,
  passwordAttempt
) {
  return savedHash == pbkdf2(passwordAttempt, savedSalt, savedIterations);
}

const getSaltForUser = async (username) => {
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
      SELECT meta_value 
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

exports.handler = async (event, context, callback) => {
  const confirmationCode = event?.pathParameters?.confirmationCode;

  await confirmAccount(confirmationCode);

  callback(null, {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      message:
        "User created successfully, Check your email for the confirmation code.",
    }),
  });
};
