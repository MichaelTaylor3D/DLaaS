const _ = require("lodash");
const mysql = require("mysql");
const { getConfigurationFile, verifyToken, queryFormat } = require("./utils");

const getAccessKeys = async (userId) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = queryFormat;

  return new Promise((resolve, reject) => {
    const sql = `SELECT access_key FROM client_access_keys WHERE user_id = :userId`;

    const params = { userId };

    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      connection.end();
      resolve(results);
    });
  });
};

exports.handler = async (event, context, callback) => {
  try {
    const bearerToken = event?.headers?.Authorization.split(" ")[1];
    if (!bearerToken) {
      throw new Error("Missing bearer token");
    }

    const decodedToken = await verifyToken(bearerToken);
    const { user_id } = decodedToken;

    const accessKeys = await getAccessKeys(user_id);

    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        access_keys: accessKeys.map((key) => key.access_key),
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
