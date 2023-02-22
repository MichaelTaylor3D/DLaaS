const _ = require("lodash");
const mysql = require("mysql");
const {
  getConfigurationFile,
  upsertUserMeta,
  getUserByEmail,
} = require("./utils");
const SES = require("aws-sdk/clients/ses");

const ses = new SES({
  apiVersion: "2010-12-01",
  region: "us-east-1",
});

const getExistingUsernameOrEmail = async (email) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(
      /\:(\w+)/g,
      function (txt, key) {
        if (values.hasOwnProperty(key)) {
          return this.escape(values[key]);
        }
        return txt;
      }.bind(this)
    );
  };

  return new Promise((resolve, reject) => {
    const sql = `
      SELECT COUNT(*) AS count
      FROM users
      WHERE email = :email;
    `;

    const params = { email };

    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      connection.end();
      resolve(results[0]);
    });
  });
};

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
