const {
  upsertUserMeta,
  getUserByEmail,
  sendEmail,
  generateConfirmationCode,
} = require("./utils");

exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const email = requestBody?.email;

    if(!email) {
      throw new Error("Missing email in body");
    }

    const existingUser = await getUserByEmail(email);

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
