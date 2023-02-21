"use strict";

const _ = require("lodash");
const mysql = require("mysql");
const crypto = require("crypto");
const SES = require("aws-sdk/clients/ses");
const { getConfigurationFile } = require("./utils");

const PASSWORD_LENGTH = 256;
const SALT_LENGTH = 8;
const ITERATIONS = 10000;
const DIGEST = "sha256";
const BYTE_TO_STRING_ENCODING = "hex"; // this could be base64, for instance

const ses = new SES({
  apiVersion: "2010-12-01",
  region: "us-east-1",
});

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    const salt = crypto
      .randomBytes(SALT_LENGTH)
      .toString(BYTE_TO_STRING_ENCODING);
    crypto.pbkdf2(
      password,
      salt,
      ITERATIONS,
      PASSWORD_LENGTH,
      DIGEST,
      (error, hash) => {
        if (error) {
          return reject(error);
        }

        resolve({
          salt,
          hash: hash.toString(BYTE_TO_STRING_ENCODING),
          iterations: ITERATIONS,
        });
      }
    );
  });
};

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
      createdAt: Date.now(),
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
  const { salt, hash } = await hashPassword(password);
  const confirmationCode = crypto.randomBytes(25).toString("hex");

  await insertUserIntoDb(username, email, hash, salt, confirmationCode);

  await ses
    .sendEmail({
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Charset: "UTF-8", Data: "DataLayer Storage" },
        Body: {
          Text: {
            Charset: "UTF-8",
            Data:
              `<div>Your account has been created successfully. click on the link below to activate your account.</div>
              <a href='https://api.datalayer.storage/v1/user/confirm?code=${confirmationCode}'>VERIFY</a>`,
          },
        },
      },
      Source: "admin@datalayer.storage",
    })
    .promise();

  callback(null, {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      message:
        "User created successfully, Check your email for the confirmation code.",
    }),
  });
};
