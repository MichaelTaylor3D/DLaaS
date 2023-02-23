const WebSocket = require("ws");
const { Consumer } = require("sqs-consumer");
const { SQSClient } = require("@aws-sdk/client-sqs");

var request = require("request");

request.post(
  "https://jkmqb7ezf0.execute-api.us-east-1.amazonaws.com/production",
  { json: { key: "value" } },
  function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
  }
);

const app = Consumer.create({
  queueUrl:
    "https://sqs.us-east-1.amazonaws.com/873139760123/tf-APIGWWebsocketQueue.fifo",
  messageAttributeNames: ["All"],
  handleMessage: async (message) => {
    console.log(message);

    const response = {
      MessageGroupId: message.MessageAttributes.connectionId.StringValue,
      connectionId: message.MessageAttributes.connectionId.StringValue,
      requestId: message.MessageAttributes.requestId.StringValue,
      message: message.Body,
    };

    console.log(response);
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
