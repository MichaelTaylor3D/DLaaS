const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const config = require("/opt/nodejs/common/config.json");

exports.handler = async (event, context) => {
  const bucket = config.DEFAULT_S3_BUCKET;
  const prefix = "";
  const delimiter = "/";

  try {
    const data = await s3
      .listObjectsV2({ Bucket: bucket, Prefix: prefix, Delimiter: delimiter })
      .promise();
    const files = data.Contents.map((file) => {
      return file.Key;
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(files),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Error getting files from S3 bucket" }),
    };
  }
};
