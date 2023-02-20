const mysql = require("mysql");
const { getConfigurationFile } = require("./utils");

const confirmAccount = async (
  confirmationCode
) => {
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
    const sql = `CALL confirm_account(:confirmationCode)`;

    const params = {
      confirmationCode,
    };

    connection.query(sql, params, (error) => {
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      connection.end();
      resolve();
    });
  });
};

exports.handler = async (event, context, callback) => {
  const confirmationCode = event?.queryStringParameters?.code;

  await confirmAccount(confirmationCode);

  callback(null, {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      message:
        "User confirmed you may now login.",
    }),
  });
};
