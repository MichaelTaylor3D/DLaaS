const {
  CloudFrontClient,
  CreateInvalidationCommand,
} = require("@aws-sdk/client-cloudfront");
const { getConfigurationFile } = require("/opt/nodejs/common");
const config = require("/opt/nodejs/common/config.js");

exports.handler = async (event) => {
  // Get the object from the event
  const key = event.Records[0].s3.object.key;

  // Get CDN configuration
  const cdnConfig = await getConfigurationFile("cdn.config.json");
  const distributionId = cdnConfig.id;

  // Create CloudFront client
  const cloudfront = new CloudFrontClient({ region: config.AWS_REGION });

  const params = {
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: `${Date.now()}`,
      Paths: {
        Quantity: 1,
        Items: [
          `/${key}`,
        ],
      },
    },
  };

  const command = new CreateInvalidationCommand(params);

  try {
    // Invalidate CloudFront cache
    const response = await cloudfront.send(command);
    console.log("CloudFront Invalidation Response: ", response);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
