const _ = require("lodash");
const crypto = require("crypto");
const { upsertUserMeta, getUserByEmail, sendEmail } = require("./utils");
const SES = require("aws-sdk/clients/ses");

const ses = new SES({
  apiVersion: "2010-12-01",
  region: "us-east-1",
});

exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const email = _.get(requestBody, "email");

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      const resetPasswordCode = crypto.randomBytes(25).toString("hex");

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
        message: "If your email was in the system, A reset password code has been emailed to you.",
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
