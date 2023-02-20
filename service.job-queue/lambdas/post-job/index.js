// Creates a job from a post request
// Writes the job data to the database and generates a
// signedS3Put url to post the file.
// The job wont be oficially queued until the file has been uploaded
// to the PUT url thats returned by this lamba.
"use strict";

// Load the AWS SDK for Node.js
const _ = require("lodash");
const AWS = require("aws-sdk");
const mysql = require("mysql");
const { uuid } = require("uuidv4");
const { getConfigurationFile } = require("utils");

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  signatureVersion: "v4",
  useAccelerateEndpoint: true,
});

// Get the configuration data
// Get the payload data
// Create a database entry
// Get a signed s3 url
// return s3 url to client
exports.handler = async (event, context, callback) => {
  let statusCode;
  let payload;
  let jobGuid;
  try {
    const sysConfig = await getConfigurationFile("system.config.json");

    AWS.config.update({ region: sysConfig.region });

    jobGuid = uuid();
    const requestBody = JSON.parse(event.body);
    const userId = _.get(requestBody, "user_id");
    const notificationEmail = _.get(requestBody, "notification_email");
    const jobType = _.get(requestBody, "job_type", "");
    const reservationToken = _.get(
      event,
      "headers.X-Reservation-Token",
      _.get(event, "headers.x-reservation-token")
    );

    if (!reservationToken) {
      statusCode = 500;
      payload = {
        message: "Missing Required Header `X-Reservation-Token`",
      };
    } else if (!userId) {
      statusCode = 500;
      payload = {
        message: "Missing Required field `user_id`",
      };
    } else if (!jobType) {
      statusCode = 500;
      payload = {
        message: "Missing Required field `job_type`",
      };
    } else {
      await insertJobIntoDb(
        jobGuid,
        userId,
        jobType,
        notificationEmail,
        reservationToken
      );

      const uploadUrl = await getPresignedUploadUrl(jobGuid, reservationToken);

      statusCode = 200;
      payload = {
        job_guid: jobGuid,
        put_url: uploadUrl,
        message:
          "job created successfully, please POST your file to the post_url provided to process this job",
      };
    }
  } catch (error) {
    console.log(error);
    statusCode = 500;
    payload = { message: error.sqlMessage };
    await revertDbInsert(jobGuid);
  } finally {
    callback(null, {
      statusCode,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
  }
};

const revertDbInsert = async (jobGuid) => {
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

  return new Promise((resolve) => {
    const sql = `DELETE from \`jobs\` WHERE \`guid\` = :jobGuid`;

    const params = { jobGuid };

    connection.query(sql, params, (error) => {
      if (error) throw error;
      connection.end();
      resolve();
    });
  });
};

const insertJobIntoDb = async (
  jobGuid,
  userId,
  jobType,
  notificationEmail,
  reservationToken
) => {
  const dbConfig = await getConfigurationFile("db.config.json");
  const { WAITING_FOR_FILE } = await getConfigurationFile(
    "job_status.enum.json"
  );

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

  const jobProperties = {};
  if (notificationEmail) {
    jobProperties.notification_email = notificationEmail;
  }

  return new Promise((resolve, reject) => {
    const sql = `CALL post_job(:userId, :jobGuid, :jobStatus, :jobType, :jobProperties, :createdAt, :reservationToken)`;

    const params = {
      userId,
      jobGuid,
      jobStatus: WAITING_FOR_FILE,
      jobType,
      jobProperties: JSON.stringify(jobProperties),
      createdAt: Date.now(),
      reservationToken,
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

const getPresignedUploadUrl = async (jobGuid, reservationToken = "") => {
  const { job_folder } = await getConfigurationFile("job-queue.config.json");

  const params = {
    Bucket: "polae-services",
    Key: `${job_folder.replace("/", "")}/${jobGuid}`, //filename
    Expires: 5 * 60, //time to expire in seconds - 5 min
    Metadata: {
      reservation_token: reservationToken,
    },
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl("putObject", params, async (error, url) => {
      if (error) {
        reject(error);
      }
      resolve(url);
    });
  });
};
