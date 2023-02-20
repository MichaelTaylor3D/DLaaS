"use strict";

const _ = require("lodash");
const AWS = require("aws-sdk");
const mysql = require("mysql");
const crypto = require("crypto");
const pbkdf2 = require("pbkdf2");

const hashPassword = (password) => {
  const salt = crypto.randomBytes(128).toString("base64");
  const iterations = 10000;
  const hash = pbkdf2(password, salt, iterations);

  return {
    salt,
    hash,
    iterations,
  };
}

const insertUserIntoDb = async (
  username,
  email,
  passwordHash,
  salt,
  confirmationCode
) => {
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
    const sql = `CALL create_new_user(:username, :email, :passwordHash, :salt, :confirmationCode)`;

    const params = {
      username,
      email,
      passwordHash,
      salt,
      confirmationCode,
      createdAt: Date.now()
    };

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
  const requestBody = JSON.parse(event.body);
  const username = _.get(requestBody, "username");
  const email = _.get(requestBody, "email");
  const password = _.get(requestBody, "password");
  const { salt, hash } = hashPassword(password);
  const confirmationCode = crypto.randomBytes(25).toString("hex");

  await insertUserIntoDb(username, email, hash, salt, confirmationCode);

  // send email with confirmation code

  callback(null, {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      message: 'User created successfully, Check your email for the confirmation code.',
    }),
  });
}
