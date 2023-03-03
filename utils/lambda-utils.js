const AWS = require("aws-sdk");
const SES = require("aws-sdk/clients/ses");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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

module.exports.queryFormat = queryFormat;

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

const getUserMeta = async (userId, metaKey) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = queryFormat;

  return new Promise((resolve, reject) => {
    const sql = `SELECT meta_value FROM user_meta WHERE user_id = :userId AND meta_key = :metaKey`;

    const params = {
      userId,
      metaKey,
    };

    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      connection.end();
      resolve(results?.[0]?.meta_value);
    });
  });
};

module.exports.getUserMeta = getUserMeta;

const deleteUserMeta = async (userId, metaKey) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = queryFormat;

  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM user_meta WHERE user_id = :userId AND meta_key = :metaKey`;

    const params = {
      userId,
      metaKey,
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

module.exports.deleteUserMeta = deleteUserMeta;

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

const getUserByEmailOrUsername = async (email, username) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = queryFormat;

  return new Promise((resolve, reject) => {
    const sql = `SELECT username, email FROM users WHERE username = :username OR email = :email`;

    const params = { email, username };

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

module.exports.getUserByEmailOrUsername = getUserByEmailOrUsername;

const getUserBy = async (column, value) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = queryFormat;

  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM users WHERE ${column} = :value`;

    const params = { column, value };

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

module.exports.getUserBy = getUserBy;

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
            Data: `<html><body>${htmlMessage || message}</body></html>`,
          },
        },
      },
      Source: "support@datalayer.storage",
    })
    .promise();
};

module.exports.sendEmail = sendEmail;

const verifyToken = async (token) => {
  const config = await getConfigurationFile("crypto.config.json");
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.token_secret, (err, decoded) => {
      if (err) {
        reject(err);
      }

      resolve(decoded);
    });
  });
};

module.exports.verifyToken = verifyToken;

const hashWithSalt = async (str, salt) => {
  const pbkdf2 = await getConfigurationFile("crypto.config.json");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      `${pbkdf2.static_salt}-${str}`,
      salt,
      pbkdf2.iterations,
      pbkdf2.password_length,
      pbkdf2.digest,
      (error, hash) => {
        if (error) {
          return reject(error);
        }

        resolve({
          str,
          hash: hash.toString(pbkdf2.byte_to_string_encoding),
        });
      }
    );
  });
};

module.exports.hashWithSalt = hashWithSalt;

const generateSalt = async () => {
  const pbkdf2 = await getConfigurationFile("crypto.config.json");

  return crypto
    .randomBytes(pbkdf2.dynamic_salt_length)
    .toString(pbkdf2.byte_to_string_encoding);
};

module.exports.generateSalt = generateSalt;

const generateConfirmationCode = () => {
  return crypto.randomBytes(25).toString("hex");
};

module.exports.generateConfirmationCode = generateConfirmationCode;

const dbQuery = async (sql, params) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = queryFormat;

  return new Promise((resolve, reject) => {
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

module.exports.dbQuery = dbQuery;

const apiResponse = (statusCode, responseBody) => {
  return {
    statusCode,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ responseBody }),
  };
};

module.exports.apiResponse = apiResponse;

const getSaveHashForAccessKey = async (accessKey) => {
  return dbQuery(
    `SELECT user_id, access_key_hash FROM access_keys WHERE access_key = :access_key`,
    {
      accessKey,
    }
  );
};

const assertBearerTokenOrBasicAuth = async (authHeader) => {
  const auth = authHeader.split(" ");
  if (["bearer", "basic"].includes(auth?.[0]?.toLowerCase())) {
    throw new Error("Missing bearer or token or client credentials");
  }

  if (auth?.[0]?.toLowerCase() === "bearer") {
    const bearerToken = auth[1];
    return await verifyToken(bearerToken);
  }

  if (auth?.[0]?.toLowerCase() === "basic") {
    const [accessKey, secretAccessKey] = Buffer.from(auth[1], "base64")
      .toString("utf-8")
      .split(":");

    const { hash } = await hashWithSalt(accessKey, secretAccessKey);

    const [saveHashResult] = await getSaveHashForAccessKey(accessKey);

    if (saveHashResult.access_key_hash !== hash) {
      throw new Error("Invalid access key.");
    }

    return { user_id: saveHashResult.user_id };
  }
};

module.exports.assertBearerTokenOrBasicAuth = assertBearerTokenOrBasicAuth;

const assertRequiredBodyParams = (body, required) => {
  required.forEach((param) => {
    if (!body[param]) {
      throw new Error(`${param} is required`);
    }
  });

  return Promise.resolve(body);
};

module.exports.assertRequiredBodyParams = assertRequiredBodyParams;
