const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const config = require("/opt/nodejs/common/config.json");

/**
 * @typedef {Object} LambdaEvent
 * @property {string} body - The request body containing store_id.
 */

/**
 * Upload a file to S3
 * @param {LambdaEvent} event - The request parameters from API Gateway.
 * @param {Object} context - The context object for the Lambda function.
 * @param {Function} callback - The callback function for API Gateway.
 */
exports.handler = async (event, context, callback) => {
  const s3 = new S3Client({ region: config.AWS_REGION }); // specify your region

  const requestBody = JSON.parse(event.body);
  const storeId = requestBody.store_id;

  // Read the file from the local filesystem
  const filePath = "./index.html";
  const fileContent = fs.readFileSync(path.resolve(__dirname, filePath));

  const params = {
    Bucket: config.DEFAULT_S3_BUCKET,
    Key: `public/${storeId}/index.html`,
    Body: fileContent,
    ContentType: "text/html",
  };

  try {
    await s3.send(new PutObjectCommand(params));

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
