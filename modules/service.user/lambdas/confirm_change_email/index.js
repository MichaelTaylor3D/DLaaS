"use strict";

const { dbQuery, getUserMeta, deleteUserMeta } = require("./utils");

const getUserByEmailChangeCode = async (code) => {
  const results = await dbQuery(
    `
    SELECT * FROM users 
    INNER JOIN user_meta ON users.id = user_meta.user_id
    WHERE user_meta.meta_value = :code
  `,
    { code }
  );

  return results?.[0];
};

exports.handler = async (event, context, callback) => {
  const code = event?.queryStringParameters?.code;

  const user = await getUserByEmailChangeCode(code);
  const pendingEmail = await getUserMeta(user.id, "pendingEmail");

  await Promise.all([
    dbQuery("UPDATE users SET email = :pendingEmail WHERE id = :userId", {
      pendingEmail,
      userId: user.id,
    }),
    deleteUserMeta(user.id, "pendingEmail"),
    deleteUserMeta(user.id, "changeEmailCode"),
  ]);

  callback(null, {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      message: `User email has been changed to ${pendingEmail}.`,
    }),
  });
};
