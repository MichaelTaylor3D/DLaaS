"use strict";

const {
  upsertUserMeta,
  getUserBy,
  sendEmail,
  generateConfirmationCode,
  assertBearerTokenOrBasicAuth,
  assertRequiredBodyParams,
} = require("./utils");

exports.handler = async (event, context, callback) => {
  try {
    const decodedToken = await assertBearerTokenOrBasicAuth(
      event?.headers?.Authorization
    );

    const { user_id } = decodedToken;

    const requestBody = JSON.parse(event.body);
    const { email } = await assertRequiredBodyParams(requestBody, ["email"]);

    const user = await getUserBy("id", user_id);
    const changeEmailCode = generateConfirmationCode();

    await Promise.all([
      upsertUserMeta(user_id, "changeEmailCode", changeEmailCode),
      upsertUserMeta(user_id, "pendingEmail", email),
      sendEmail(
        user.email,
        "DataLayer Storage Email Change",
        `A Request has been made to change you email to ${email}. If this was not you, go to the following link to cancel. https://api.datalayer.storage/user/v1/cancel_change_email?code=${changeEmailCode}`,
        `<div>A Request has been made to change you email to ${email}. If this was not you, Click on the link below to cancel the request.</div><a href='https://api.datalayer.storage/user/v1/cancel_change_email?code=${changeEmailCode}'>Cancel Email Change</a>`
      ),
      sendEmail(
        email,
        "DataLayer Storage Email Change",
        `An email change request has been made. Go to the following link to confirm. https://api.datalayer.storage/user/v1/confirm_change_email?code=${changeEmailCode}`,
        `<div>An email change request has been made. Click on the link below to confirm email change.</div><a href='https://api.datalayer.storage/user/v1/confirm_change_email?code=${changeEmailCode}'>Confirm Email</a>`
      ),
    ]);

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: "Email change request processed. Check you email to confirm.",
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
