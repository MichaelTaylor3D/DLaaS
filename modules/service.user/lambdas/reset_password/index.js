"use strict";

const {
  upsertUserMeta,
  getUserByEmail,
  sendEmail,
  generateConfirmationCode,
  assertBearerTokenOrBasicAuth,
  assertRequiredBodyParams,
  getUserBy,
} = require("./utils");

exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);

    const decodedToken = await assertBearerTokenOrBasicAuth(event?.headers?.Authorization);

    const { email } = await assertRequiredBodyParams(requestBody, ["email"]);

    const existingUser = await getUserBy("id", decodedToken.user_id);

    if (existingUser) {
      const resetPasswordCode = generateConfirmationCode();

      await upsertUserMeta(
        existingUser.id,
        "resetPasswordCode",
        resetPasswordCode
      );

      await sendEmail(
        email,
        "DataLayer Storage Reset Email Request",
        `Your reset password code is: ${resetPasswordCode}.`,
        `<div>Your reset password code is:</div><div>${resetPasswordCode}</div>`
      );
    }

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message:
          "If your email was in the system, A reset password code has been emailed to you.",
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
