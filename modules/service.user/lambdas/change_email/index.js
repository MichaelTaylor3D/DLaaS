"use strict";

const {
  upsertUserMeta,
  getUserBy,
  sendEmail,
  generateConfirmationCode,
  verifyToken,
} = require("./utils");

exports.handler = async (event, context, callback) => {
  try {
    const auth = event?.headers?.Authorization.split(" ");
    if (auth?.[0].toLowerCase() !== "bearer") {
      throw new Error("Missing bearer token");
    }

    const bearerToken = auth[1];

    const decodedToken = await verifyToken(bearerToken);
    const { user_id } = decodedToken;

    const requestBody = JSON.parse(event.body);
    const email = requestBody?.email;

    if (!email) {
      throw new Error("Missing email in body");
    }

    const user = await getUserBy('id', user_id);
    const changeEmailCode = generateConfirmationCode();

    await Promise.all([
      upsertUserMeta(user_id, "changeEmailCode", changeEmailCode),
      upsertUserMeta(user_id, "pendingEmail", email),
      sendEmail(
        user.email,
        "DataLayer Storage Email Change",
        `A Request has been made to change you email to ${email}. If this was not you, go to the following link to cancel. https://api.datalayer.storage/v1/user/cancel_change_email?code=${changeEmailCode}`,
        `<div>A Request has been made to change you email to ${email}. If this was not you, Click on the link below to cancel the request.</div><a href='https://api.datalayer.storage/v1/user/cancel_change_email?code=${changeEmailCode}'>Cancel Email Change</a>`
      ),
      sendEmail(
        email,
        "DataLayer Storage Email Change",
        `An email change request has been made. Go to the following link to confirm. https://api.datalayer.storage/v1/user/confirm_change_email?code=${changeEmailCode}`,
        `<div>An email change request has been made. Click on the link below to confirm email change.</div><a href='https://api.datalayer.storage/v1/user/confirm_change_email?code=${changeEmailCode}'>Confirm Email</a>`
      ),
    ]);

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message:
          "Email change request processed. Check you email to confirm.",
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
