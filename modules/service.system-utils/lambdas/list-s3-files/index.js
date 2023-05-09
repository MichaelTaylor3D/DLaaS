const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const config = require("/opt/nodejs/common/config.json");


const s3 = new S3Client({ region: config.AWS_REGION });
const bucket = config.DEFAULT_S3_BUCKET;
const delimiter = "/";

exports.handler = async (event, context) => {
  const prefix = event.queryStringParameters?.prefix || "";

  try {
    const data = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix.replace(/^\//, ""),
        Delimiter: delimiter,
      })
    );

    const files = data.Contents.map((file) => {
      return file.Key.split("/").pop();
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": `https://cdn.${config.SERVICE_DOMAIN}`,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
      },
      body: JSON.stringify(files),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": `https://cdn.${config.SERVICE_DOMAIN}`,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
      },
      body: JSON.stringify({ message: "Error getting files from S3 bucket" }),
    };
  }
};
