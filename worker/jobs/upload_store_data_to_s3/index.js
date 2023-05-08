const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const config = require("../../../common/config.json");
const { getChiaRoot } = require("../../utils");

/**
 * Uploads full_tree_filename and diff_filename to the specified S3 bucket and location.
 * @param {Object} payload - The payload object containing store_id, full_tree_filename, and diff_filename.
 * @returns {Promise<boolean>} - Returns true if both files were uploaded successfully, false otherwise.
 */
const uploadStoreDataToS3 = async (payload) => {
  const { store_id, full_tree_filename, diff_filename } = payload;
  const chiaRoot = getChiaRoot();
  const Bucket = config.DEFAULT_S3_BUCKET;

  const uploadFile = async (filename) => {
    const sourceFilePath = path.join(
      chiaRoot,
      "data_layer",
      "db",
      "server_files_location_mainnet",
      filename
    );
    const destinationKey = `public/${store_id}/${filename}`;

    // Read the file from the local file system
    const fileStream = fs.createReadStream(sourceFilePath);

    // Upload the file to the S3 bucket
    const params = {
      Bucket,
      Key: destinationKey,
      Body: fileStream,
    };

    try {
      await s3.send(new PutObjectCommand(params));
      return true;
    } catch (error) {
      console.error("Error:", error.message);
      return false;
    }
  };

  // Create the S3 client
  const s3 = new S3Client({
    region: "us-east-1",
    useAccelerateEndpoint: true,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const fullTreeUploadSuccess = await uploadFile(full_tree_filename);
    const diffUploadSuccess = await uploadFile(diff_filename);

    return fullTreeUploadSuccess && diffUploadSuccess;
  } catch (error) {
    console.error("Error:", error.message);
    return false;
  }
};

module.exports = {
  uploadStoreDataToS3,
};
