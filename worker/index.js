/**
 * @fileoverview A worker process that handles RPC jobs from an SQS queue and
 * sends the results back to the client through a WebSocket connection.
 */

const { Consumer } = require("sqs-consumer");
const { SQSClient } = require("@aws-sdk/client-sqs");
const AWS = require("aws-sdk");

const { getConfigurationFile } = require("../utils/lambda-utils");
const rpc = require("../common/rpc");
const jobs = require("./jobs");
const utils = require("../utils");

const concurrentJobs = process.env.CONCURRENT_JOBS;
const consumers = {};

let globalConfigs;

/**
 * Processes a job and sends the result back to the client using the provided options.
 * @async
 * @param {string} jobKey - The key of the job to be processed.
 * @param {string} connectionId - The connection ID from the message object.
 * @param {Object} options - The options for sending the result back to the client.
 */
const processJob = async (jobKey, connectionId, options) => {
  const result = jobs[jobKey]();

  const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
    endpoint: options.postback_url,
    region: options.aws_region,
  });

  const params = {
    ConnectionId: connectionId,
    Data: JSON.stringify({ success: true, result }),
  };

  apigatewaymanagementapi.postToConnection(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else test = 1;
  });
};

/**
 * Fetches the global configurations for the worker process.
 * @async
 * @returns {Promise<Object[]>} The global configurations.
 */
const fetchGlobalConfigs = async () => {
  return Promise.all([
    getConfigurationFile("websocket.config.json"),
    getConfigurationFile("command-queue.config.json"),
  ]);
};

/**
 * Runs a worker process to handle jobs from the SQS queue.
 * @async
 * @param {string} workerIdentifier - The identifier for the worker process.
 */
const runWorker = async (workerIdentifier) => {
  const [{ postback_url, aws_region }, { queue_url }] = globalConfigs;

  consumers[workerIdentifier] = Consumer.create({
    queueUrl: queue_url,
    messageAttributeNames: ["All"],
    handleMessage: async (message) => {
      console.log(message);
      const connectionId = message.MessageAttributes.connectionId.StringValue;
      if (utils.matchKey(rpc, message.Body)) {
        await processJob(message.Body, connectionId, {
          postback_url,
          aws_region,
        });
      } else {
        console.log("Invalid message key");
      }
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
