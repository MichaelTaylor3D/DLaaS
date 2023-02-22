"use strict";

const { dbQuery } = require("./utils");

const confirmAccount = async (confirmationCode) => {
  return dbQuery("CALL confirm_account(:confirmationCode)", {
    confirmationCode,
  });
};

exports.handler = async (event, context, callback) => {
  try {
    const confirmationCode = event?.queryStringParameters?.code;

    await confirmAccount(confirmationCode);

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: "User confirmed you may now login.",
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
