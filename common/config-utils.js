/**
 * @fileoverview This module provides a function to retrieve a configuration file
 * from an S3 bucket using the AWS SDK for JavaScript (v3).
 */

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "us-east-1",
});

const appConfig = require("./config.json");

/**
 * Retrieves a configuration file from an S3 bucket.
 * @async
 * @function
 * @param {string} filename - The name of the configuration file to retrieve.
 * @returns {Promise<Object>} - A promise that resolves with the configuration file as an object.
 * @throws {Error} If there was an issue retrieving the file from the S3 bucket.
 */
const getConfigurationFile = async (filename) => {
  // Define the bucket parameters, specifying the target Bucket and Key (file path)
  const bucketParams = {
    Bucket: `${appConfig.DEFAULT_S3_BUCKET}.devops`,
    Key: `configurations/${filename}`,
  };

  try {
    // Send a GetObjectCommand to the S3 client to retrieve the specified file
    const result = await s3.send(new GetObjectCommand(bucketParams));
    // Convert the received file stream to a string
    const fileData = await streamToString(result.Body);
    // Parse the file data as JSON and return the resulting object
    return JSON.parse(fileData);
  } catch (err) {
    // Throw an error with a descriptive message if the file retrieval fails
    throw new Error(
      `There was an error grabbing ${bucketParams.Key} from S3 bucket ${bucketParams.Bucket}. Error: ${err}`
    );
  }
};

/**
 * Converts a stream to a string.
 * @param {ReadableStream} stream - The stream to convert to a string.
 * @returns {Promise<string>} - A promise that resolves with the resulting string.
 * @throws {Error} If there was an issue reading the stream.
 */
const streamToString = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", (error) => reject(error));
  });
};

const generateStoreUploadKey = (storeId, salt, filename) => {
  if (filename) {
    return `${storeId}/${salt}/${filename}`;
  }
  return `${storeId}/${salt}`;
};

module.exports = {
  getConfigurationFile,
  generateStoreUploadKey,
};
