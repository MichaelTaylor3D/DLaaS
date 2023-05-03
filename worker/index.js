/**
 * @fileoverview A worker process that handles RPC jobs from an SQS queue and
 * sends the results back to the client through a WebSocket connection.
 */
require("dotenv").config();
const { Consumer } = require("sqs-consumer");
const { SQSClient } = require("@aws-sdk/client-sqs");
const {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} = require("@aws-sdk/client-apigatewaymanagementapi");

const { getConfigurationFile } = require("../common/config-utils");
const rpc = require("../common/rpc");
const jobs = require("./jobs");
const utils = require("./utils");

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
  console.log("processing job", jobKey);
  const result = jobs[jobKey]();

  const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
    apiVersion: "2018-11-29",
    endpoint: options.postback_url,
    region: options.aws_region,
  });

  const command = new PostToConnectionCommand({
    ConnectionId: connectionId,
    Data: JSON.stringify({ success: true, result }),
  });

  await apiGatewayManagementApi.send(command);
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
const runWorker = async () => {
  try {
    console.log("running worker");
    const [{ postback_url, aws_region }, { queue_url }] = globalConfigs;

    const consumer = Consumer.create({
      queueUrl: queue_url,
      messageAttributeNames: ["All"],
      handleMessage: async (message) => {
        console.log("received message", message);
        const data = JSON.parse(message.Body);
        const connectionId =
          message?.MessageAttributes?.connectionId?.StringValue || 1;
        console.log(data, connectionId);
        if (utils.matchKey(rpc, data.cmd)) {
          await processJob(data.cmd, connectionId, {
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

    consumer.on("error", (err) => {
      console.error(err.message);
    });

    consumer.on("processing_error", (err) => {
      console.error(err.message);
    });

    consumer.on("timeout_error", (err) => {
      console.error(err.message);
    });

    consumer.start();
  } catch (error) {
    console.trace(error.message);
  }
};

const start = async () => {
  globalConfigs = await fetchGlobalConfigs();
  await runWorker();
};

start();
