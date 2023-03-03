"use strict";

const { passwordStrength } = require("check-password-strength");
const {
  generateSalt,
  sendEmail,
  dbQuery,
  hashWithSalt,
  upsertUserMeta,
  assertRequiredBodyParams,
} = require("./utils");

const getUserByResetCode = async (resetCode) => {
  const results = await dbQuery(
    `
    SELECT * FROM users 
    INNER JOIN user_meta ON users.id = user_meta.user_id
    WHERE user_meta.meta_value = :resetCode
  `,
    { resetCode }
  );

  return results?.[0];
};

const deleteUserMeta = async (resetCode) => {
  return dbQuery(`DELETE FROM user_meta WHERE meta_value = :resetCode`, {
    resetCode,
  });
};

const resetPassword = async (newPassword, userId) => {
  const salt = await generateSalt();
  const { hash } = await hashWithSalt(newPassword, salt);

  return Promise.all([
    dbQuery(`UPDATE users SET password_hash = :hash WHERE id = :userId`, {
      hash,
      userId,
    }),
    upsertUserMeta(userId, "salt", salt),
  ]);
};

exports.handler = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { password, code } = await assertRequiredBodyParams(requestBody, [
      "password",
      "code",
    ]);

    if (passwordStrength(password).value !== "Strong") {
      throw new Error(
        "Password is not strong enough. Min Legnth: 10, Requires 1 of each of the following: ['lowercase', 'uppercase', 'symbol', 'number']"
      );
    }

    const existingUser = await getUserByResetCode(code);

    // Code is valid
    if (existingUser) {
      await deleteUserMeta(code);
      await resetPassword(password, existingUser.user_id);

      await sendEmail(
        existingUser.email,
        "DataLayer Storage Reset Email Confirmation",
        `The password on your account has changed. If you did not request this change, please contact the administrator immediately.`
      );
    }

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message:
          "If your reset password code was valid, Your password has now been changed. A confirmation email has been sent to you.",
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
