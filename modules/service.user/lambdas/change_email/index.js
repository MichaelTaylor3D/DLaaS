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
    const bearerToken = event?.headers?.Authorization.split(" ")[1];
    if (!bearerToken) {
      throw new Error("Missing bearer token");
    }

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
        `A Request has been made to change you email to ${email}. If this was not you, go to the following link to cancel. https://api.datalayer.storage/v1/user/cancel_email_change?code=${changeEmailCode}`,
        `<div>A Request has been made to change you email to ${email}. If this was not you, Click on the link below to cancel the request.</div><a href='https://api.datalayer.storage/v1/user/cancel_email_change?code=${changeEmailCode}'>Cancel Email Change</a>`
      ),
      sendEmail(
        email,
        "DataLayer Storage Account Creation",
        `An email change request has been made. Go to the following link to confirm. https://api.datalayer.storage/v1/user/confirm_email_change?code=${confirmationCode}`,
        `<div>An email change request has been made. Click on the link below to confirm email change.</div><a href='https://api.datalayer.storage/v1/user/confirm_email_change?code=${confirmationCode}'>Activate Account</a>`
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
