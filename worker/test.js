const { Consumer } = require("sqs-consumer");
const { SQSClient } = require("@aws-sdk/client-sqs");
const AWS = require("aws-sdk");
var apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
  endpoint: "https://5ickpu83ci.execute-api.us-east-1.amazonaws.com/production",
  region: "us-east-1",
});

const app = Consumer.create({
  queueUrl:
    "https://sqs.us-east-1.amazonaws.com/873139760123/worker-gateway-message-handler.fifo",
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
    region: "us-east-1",
    credentials: {
      accessKeyId: "AKIA4WSZPNP52LY2IJDV",
      secretAccessKey: "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",
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
