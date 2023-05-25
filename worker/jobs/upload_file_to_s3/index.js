/**
 * @fileoverview This module provides a function for uploading a file to Amazon S3.
 * It fetches the necessary credentials and configurations, checks if the file exists,
 * retrieves the salts for the file from the database, and finally uploads the file to S3.
 */

const {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const { dbQuery, generateStoreUploadKey } = require("../../../common");
const config = require("../../../common/config.json");
const { getChiaRoot } = require("../../utils");

/**
 * Uploads a file to the specified S3 bucket and location.
 * @param {Object} payload - The payload object containing store_id and file.
 * @returns {Promise<boolean>} - Returns true if the file was uploaded successfully, false otherwise.
 */
async function uploadFileToS3(payload) {
  const { store_id, file } = payload;
  const chiaRoot = getChiaRoot();
  const Bucket = config.DEFAULT_S3_BUCKET;
  const sourceFilePath = generateSourceFilePath(chiaRoot, file);

  const s3 = createS3Client();

  if (!isFileExists(sourceFilePath)) {
    return false;
  }

  await uploadFilesToS3(s3, Bucket, store_id, file, sourceFilePath);

  return true;
}

function generateSourceFilePath(chiaRoot, file) {
  return path.join(
    chiaRoot,
    "data_layer",
    "db",
    "server_files_location_mainnet",
    file
  );
}

function createS3Client() {
  return new S3Client({
    region: config.AWS_REGION,
    useAccelerateEndpoint: true,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

function isFileExists(sourceFilePath) {
  if (!fs.existsSync(sourceFilePath)) {
    console.error(`File does not exist: ${sourceFilePath}`);
    return false;
  }
  return true;
}

async function uploadFilesToS3(s3, Bucket, storeId, file, sourceFilePath) {
  const mirrors = await dbQuery(
    `SELECT salt, permissioned_for FROM user_mirrors WHERE singleton_id = :storeId`,
    { storeId }
  );

  for (const { salt, permissioned_for } of mirrors) {
    const destinationKey = generateStoreUploadKey(storeId, salt, file);
    const permissionedEmailAddresses = JSON.parse(permissioned_for);
    const fileStream = fs.createReadStream(sourceFilePath);

    uploadIndexHtml(storeId, salt);

    const params = generateParamsForS3(
      Bucket,
      destinationKey,
      fileStream,
      permissionedEmailAddresses
    );

    console.log(`Uploading file to S3: ${destinationKey}`);

    try {
      await s3.send(new PutObjectCommand(params));
    } catch (error) {
      console.error("Error:", error.message);
      return false;
    }
  }
  return true;
}

function generateParamsForS3(
  Bucket,
  destinationKey,
  fileStream,
  permissionedEmailAddresses
) {
  const params = {
    Bucket,
    Key: destinationKey,
    Body: fileStream,
  };

  if (isStorePermissioned(permissionedEmailAddresses)) {
    params.AccessControlPolicy = {
      Grants: permissionedEmailAddresses.map((email) => ({
        Grantee: {
          Type: "AmazonCustomerByEmail",
          EmailAddress: email,
        },
        Permission: "READ",
      })),
    };
  }

  return params;
}

function isStorePermissioned(permissionedEmailAddresses) {
  return (
    permissionedEmailAddresses?.length > 0 &&
    permissionedEmailAddresses?.[0] !== "All"
  );
}

async function uploadIndexHtml(storeId, salt) {
  const s3 = new S3Client({ region: config.AWS_REGION });
  const filePath = "./index.html";
  const fileContent = fs.readFileSync(path.resolve(__dirname, filePath));
  const destinationKey = generateStoreUploadKey(storeId, salt, "index.html");

  const params = {
    Bucket: config.DEFAULT_S3_BUCKET,
    Key: destinationKey,
    Body: fileContent,
    ContentType: "text/html",
  };

  // Check if the object already exists in the bucket
  const headParams = { Bucket: params.Bucket, Key: params.Key };
  try {
    await s3.send(new HeadObjectCommand(headParams));
    return;
  } catch (headErr) {
    console.log("File does not exist, proceeding with upload.");
  }

  s3.send(new PutObjectCommand(params));
}

module.exports = {
  uploadFileToS3,
};
