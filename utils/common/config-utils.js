const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  signatureVersion: "v4",
  useAccelerateEndpoint: true,
});

const appConfig = require("../config.json");

/**
 * Retrieves a configuration file from an S3 bucket.
 * @async
 * @function
 * @param {string} filename - The name of the configuration file to retrieve.
 * @returns {Promise<Object>} - A promise that resolves with the configuration file as an object.
 * @throws {Error} If there was an issue retrieving the file from the S3 bucket.
 */
const getConfigurationFile = async (filename) => {
  // Create the parameters for calling getObject
  const bucketParams = {
    Bucket: `${appConfig.DEFAULT_S3_BUCKET}.devops`,
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

  // Parse the obtained file data and return it as an object
  return JSON.parse(fileData.Body.toString("utf-8"));
};

module.exports = {
  getConfigurationFile,
};
