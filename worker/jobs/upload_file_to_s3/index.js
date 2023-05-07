const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const config = require("../../../common/config.json");
const { getChiaRoot } = require("../../utils");

/**
 * Uploads a file to the specified S3 bucket and location.
 * @param {Object} payload - The payload object containing store_id and file.
 * @returns {Promise<boolean>} - Returns true if the file was uploaded successfully, false otherwise.
 */
const uploadFileToS3 = async (payload) => {
  const { store_id, file } = payload;
  const chiaRoot = getChiaRoot();
  const Bucket = config.DEFAULT_S3_BUCKET;
  const sourceFilePath = path.join(
    chiaRoot,
    "data_layer",
    "db",
    "server_files_location_mainnet",
    file
  );
  const destinationKey = `public/${store_id}/${file}`;

  // Create the S3 client
  const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    signatureVersion: "v4",
    useAccelerateEndpoint: true,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  // Read the file from the local file system
  const fileStream = fs.createReadStream(sourceFilePath);

  // Upload the file to the S3 bucket
  const params = {
    Bucket,
    Key: destinationKey,
    Body: fileStream,
  };

  try {
    await s3.upload(params).promise();
    return true;
  } catch (error) {
    console.error("Error:", error.message);
    return false;
  }
};

module.exports = {
  uploadFileToS3,
};
