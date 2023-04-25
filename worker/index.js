const { Consumer } = require("sqs-consumer");
const { SQSClient } = require("@aws-sdk/client-sqs");
const AWS = require("aws-sdk");

const { getConfigurationFile } = require("../utils/lambda-utils");
const jobs = require("./jobs");

const concurrentJobs = process.env.CONCURRENT_JOBS;
const consumers = {};

let globalConfigs;

const processJob = async (jobKey, options) => {
  const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
    endpoint: options.postback_url,
    region: options.aws_region,
  });

  var params = {
    ConnectionId: message.MessageAttributes.connectionId.StringValue,
    Data: JSON.stringify({ success: true }),
  };

  apigatewaymanagementapi.postToConnection(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else test = 1; // successful response
  });
};

const fetchGlobalConfigs = async () => {
  return Promise.all([
    getConfigurationFile("websocket.config.json"),
    getConfigurationFile("command-queue.config.json"),
  ]);
};

const runWorker = async (workerIdentifier) => {
  const [{ postback_url, aws_region }, { queue_url }] = globalConfigs;

  consumers[workerIdentifier] = Consumer.create({
    queueUrl: queue_url,
    messageAttributeNames: ["All"],
    handleMessage: async (message) => {
      console.log(message);
      await processJob(message.Body, { postback_url, aws_region });
    },
    sqs: new SQSClient({
      region: aws_region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    }),
  });

  consumers[workerIdentifier].on("error", (err) => {
    console.error(err.message);
  });

  consumers[workerIdentifier].on("processing_error", (err) => {
    console.error(err.message);
  });

  consumers[workerIdentifier].on("timeout_error", (err) => {
    console.error(err.message);
  });

  consumers[workerIdentifier].start();
};

(async () => {
  globalConfigs = await fetchGlobalConfigs();

  for (let i = 0; i < concurrentJobs; i++) {
    runWorker(`worker-${i}`);
  }
})();
