"use strict";

const { passwordStrength } = require("check-password-strength");
const {
  hashWithSalt,
  generateSalt,
  sendEmail,
  generateConfirmationCode,
  getUserByEmailOrUsername,
  dbQuery,
  assertRequiredBodyParams,
} = require("./utils");

const insertUserIntoDb = async (
  username,
  email,
  passwordHash,
  salt,
  confirmationCode
) => {
  return dbQuery(
    `CALL create_new_user(:username, :email, :passwordHash, :salt, :confirmationCode)`,
    {
      username,
      email,
      passwordHash,
      salt,
      confirmationCode,
      createdAt: Date.now(),
    }
  );
};

exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { username, email, password } = await assertRequiredBodyParams(
      requestBody,
      ["username", "email", "password"]
    );

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

    const salt = await generateSalt();
    const { hash } = await hashWithSalt(password, salt);
    const confirmationCode = generateConfirmationCode();

    await insertUserIntoDb(username, email, hash, salt, confirmationCode);

    await sendEmail(
      email,
      "DataLayer Storage Account Creation",
      `Your account has been created successfully. Go to the following link to activate your account. https://api.datalayer.storage/user/v1/confirm?code=${confirmationCode}`,
      `<div>Your account has been created successfully. Click on the link below to activate your account.</div><a href='https://api.datalayer.storage/user/v1/confirm?code=${confirmationCode}'>Activate Account</a>`
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
