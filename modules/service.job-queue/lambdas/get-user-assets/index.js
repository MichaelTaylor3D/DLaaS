const fetch = require("node-fetch");
const _ = require("lodash");
const mysql = require("mysql");
const { getConfigurationFile } = require("utils");

exports.handler = async (event, context, callback) => {
  let { user_id } = event.pathParameters;
  const reservationToken = _.get(
    event,
    "headers.X-Reservation-Token",
    _.get(event, "headers.x-reservation-token")
  );

  if (!user_id) {
    callback(null, {
      statusCode: 404,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        status: 404,
        message: "user_id not found",
      }),
    });
    return;
  }

  if (reservationToken) {
    refreshReservationToken(reservationToken);
  }

  const assets = await getUserAssets(user_id);
  callback(null, {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(assets),
  });
};

const refreshReservationToken = async (reservationToken) => {
  const apiConfig = await getConfigurationFile("api.config.json");

  fetch(`${apiConfig.endpoint}/reservations/v1/capacity`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "X-Api-Key": apiConfig.api_key,
      "Content-Type": "application/json",
      "X-Reservation-Token": reservationToken,
    },
  });
};

const getUserAssets = async (userId) => {
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
    const sql = `SELECT user_assets.referance, jobs.job_type, jobs.job_status FROM jobs
      LEFT JOIN user_assets on user_assets.guid = jobs.guid
      WHERE jobs.user_id = :userId
      GROUP BY jobs.job_type`;

    const params = { userId };

    connection.query(sql, params, (error, results) => {
      if (error) throw error;
      connection.end();
      if (results) {
        resolve(transformJobResults(results));
      } else {
        reject("Job Guid does not exist");
      }
    });
  });
};

const transformJobResults = (results) => {
  const data = {
    responses: [],
  };

  results.forEach((result) => {
    data.responses.push({
      job_type: result.job_type,
      uri: result.referance,
      status: result.job_status,
    });
  });

  return data;
};
