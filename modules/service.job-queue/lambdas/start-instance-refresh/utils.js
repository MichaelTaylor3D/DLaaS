const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  signatureVersion: "v4",
  useAccelerateEndpoint: true,
});

const getConfigurationFile = async (filename) => {
  // Create the parameters for calling getObject
  const bucketParams = {
    Bucket: "polae-services.dev",
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
