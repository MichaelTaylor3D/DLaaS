const { Consumer } = require("sqs-consumer");
const { SQSClient } = require("@aws-sdk/client-sqs");
const AWS = require("aws-sdk");

const { getConfigurationFile } = require("../utils/lambda-utils");

const runWorker = async () => {
  const [{postback_url, aws_region}, {queue_url}] = await Promise.all([
    getConfigurationFile("websocket.config.json"),
    getConfigurationFile("command-queue.config.json"),
  ]);

  const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
    endpoint: postback_url,
    region: aws_region,
  });

  const app = Consumer.create({
    queueUrl: queue_url,
    messageAttributeNames: ["All"],
    handleMessage: async (message) => {
      console.log(message);

      var params = {
        ConnectionId: message.MessageAttributes.connectionId.StringValue,
        Data: JSON.stringify({ success: true }),
      };

      apigatewaymanagementapi.postToConnection(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else test = 1; // successful response
      });
    },
    sqs: new SQSClient({
      region: aws_region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    }),
  });

  app.on("error", (err) => {
    console.error(err.message);
  });

  app.on("processing_error", (err) => {
    console.error(err.message);
  });

  app.on("timeout_error", (err) => {
    console.error(err.message);
  });

  app.start();
};

runWorker();
