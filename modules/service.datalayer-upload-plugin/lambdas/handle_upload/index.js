/**
 * @fileoverview AWS Lambda function to handle the upload of an "index.html" file to a specified S3 bucket.
 * Checks whether the file already exists at the target location in the bucket. If the file exists,
 * the function responds with a 200 status and message indicating the file already exists. If not,
 * it proceeds with the upload. In case of any errors during this process, the function responds
 * with a 500 status and a message detailing the error that occurred.
 */

const {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const config = require("/opt/nodejs/common/config.json");

exports.handler = async (event, context, callback) => {
  const s3 = new S3Client({ region: config.AWS_REGION });

  const requestBody = JSON.parse(event.body);
  const storeId = requestBody.store_id;

  const filePath = "./index.html";
  const fileContent = fs.readFileSync(path.resolve(__dirname, filePath));

  const params = {
    Bucket: config.DEFAULT_S3_BUCKET,
    Key: `public/${storeId}/index.html`,
    Body: fileContent,
    ContentType: "text/html",
  };

  try {
    // Check if the object already exists in the bucket
    const headParams = { Bucket: params.Bucket, Key: params.Key };
    try {
      await s3.send(new HeadObjectCommand(headParams));
      console.log("File already exists.");
      callback(null, {
        statusCode: 200, // Conflict
        body: JSON.stringify({ handle_upload: true }),
      });
      return;
    } catch (headErr) {
      if (headErr.name === "NoSuchKey") {
        console.log("File does not exist, proceeding with upload.");
      } else {
        throw headErr; // An error other than NoSuchKey occurred
      }
    }

    s3.send(new PutObjectCommand(params));

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ handle_upload: true }),
    });
  } catch (err) {
    console.log(err);
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({ error: "Error uploading file" }),
    });
  }
};
