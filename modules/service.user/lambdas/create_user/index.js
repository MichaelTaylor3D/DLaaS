"use strict";

const _ = require("lodash");
const mysql = require("mysql");
const crypto = require("crypto");
const { passwordStrength } = require("check-password-strength");
const {
  getConfigurationFile,
  hashWithSalt,
  generateSalt,
  sendEmail,
  generateConfirmationCode,
  getUserByEmailOrUsername,
  queryFormat,
} = require("./utils");

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

  connection.config.queryFormat = queryFormat;

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
  try {
    const requestBody = JSON.parse(event.body);
    const username = _.get(requestBody, "username");
    const email = _.get(requestBody, "email");
    const password = _.get(requestBody, "password");

    if (passwordStrength(password).value !== "Strong") {
      throw new Error(
        "Password is not strong enough. Min Legnth: 10, Requires 1 of each of the following: ['lowercase', 'uppercase', 'symbol', 'number']"
      );
    }

    const existingUser = await getUserByEmailOrUsername(email, username);

    if (existingUser?.username === username) {
      throw new Error("Username already exists.");
    }

    if (existingUser?.email === email) {
      throw new Error("Email already exists.");
    }

    const { hash } = await hashWithSalt(password, await generateSalt());
    const confirmationCode = generateConfirmationCode();

    await insertUserIntoDb(username, email, hash, salt, confirmationCode);

    await sendEmail(
      email,
      "DataLayer Storage Account Creation",
      `Your account has been created successfully. Go to the following link to activate your account. https://api.datalayer.storage/v1/user/confirm?code=${confirmationCode}`,
      `<div>Your account has been created successfully. Click on the link below to activate your account.</div><a href='https://api.datalayer.storage/v1/user/confirm?code=${confirmationCode}'>Activate Account</a>`
    );

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message:
          "User created successfully, Check your email for the confirmation code.",
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
