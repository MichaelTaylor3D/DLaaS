/* it worked! */
const AWS = require("aws-sdk");
const mysql = require("mysql");
const SES = require("aws-sdk/clients/ses");

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  signatureVersion: "v4",
  useAccelerateEndpoint: true,
});

const ses = new SES({
  apiVersion: "2010-12-01",
  region: "us-east-1",
});


const queryFormat = function (query, values) {
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

const getConfigurationFile = async (filename) => {
  // Create the parameters for calling getObject
  const bucketParams = {
    Bucket: "dlstorage-services.dev",
    Key: `configurations/${filename}`,
  };

  let fileData = {};

  // Call S3 to obtain a list of the objects in the bucket
  try {
    fileData = await s3.getObject(bucketParams).promise();
  } catch (err) {
    return (
      "There was an error grabbing " +
      bucketParams.Key +
      " from S3 bucket " +
      bucketParams.Bucket +
      ". Error: " +
      err
    );
  }

  return JSON.parse(fileData.Body.toString("utf-8"));
};

module.exports.getConfigurationFile = getConfigurationFile;

const upsertUserMeta = async (userId, metaKey, metaValue) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = queryFormat;

  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO user_meta (user_id, meta_key, meta_value) VALUES (:userId, :metaKey, :metaValue) ON DUPLICATE KEY UPDATE user_id = :userId1, meta_key = :metaKey1, meta_value = :metaValue1`;

    const params = {
      userId,
      metaKey,
      metaValue,
      userId1: userId,
      metaKey1: metaKey,
      metaValue1: metaValue,
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

module.exports.upsertUserMeta = upsertUserMeta;

const getUserByEmail = async (email) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = queryFormat;

  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM users WHERE email = :email`;

    const params = { email };

    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      connection.end();
      resolve(results?.[0]);
    });
  });
};

module.exports.getUserByEmail = getUserByEmail;

const sendEmail = async (email, title, message, htmlMessage) => {
  return ses
    .sendEmail({
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: {
          Charset: "UTF-8",
          Data: title,
        },
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: message,
          },
          Html: {
            Data: `<html><body>${htmlMessage}</body></html>`,
          },
        },
      },
      Source: "support@datalayer.storage",
    })
    .promise();
};

module.exports.sendEmail = sendEmail;