const _ = require("lodash");
const {
  upsertUserMeta,
  getUserByEmail,
} = require("./utils");
const SES = require("aws-sdk/clients/ses");

const ses = new SES({
  apiVersion: "2010-12-01",
  region: "us-east-1",
});

exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const email = _.get(requestBody, "username");

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      const resetPasswordCode = crypto.randomBytes(25).toString("hex");

      await upsertUserMeta(
        existingUser.id,
        "resetPasswordCode",
        resetPasswordCode
      );

      await ses
        .sendEmail({
          Destination: { ToAddresses: [email] },
          Message: {
            Subject: {
              Charset: "UTF-8",
              Data: "DataLayer Storage Reset Email Request",
            },
            Body: {
              Text: {
                Charset: "UTF-8",
                Data: `Your reset password code is: ${resetPasswordCode}.`,
              },
              Html: {
                Data: `<html><body><div>Your reset password code is:</div><div>${resetPasswordCode}</div></body></html>`,
              },
            },
          },
          Source: "support@datalayer.storage",
        })
        .promise();
    }

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: "A reset password code has been emailed to you.",
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
