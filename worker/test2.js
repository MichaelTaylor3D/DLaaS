const WebSocket = require("ws");
const { Consumer } = require("sqs-consumer");
const { SQSClient } = require("@aws-sdk/client-sqs");

const app = Consumer.create({
  queueUrl:
    "https://sqs.us-east-1.amazonaws.com/873139760123/worker-gateway-message-handler.fifo",
  messageAttributeNames: ["All"],
  handleMessage: async (message) => {
    console.log(message);

    const response = {
      MessageGroupId: message.MessageAttributes?.connectionId?.StringValue || 1,
      connectionId: message.MessageAttributes?.connectionId?.StringValue || 1,
      requestId: message.MessageAttributes?.requestId?.StringValue || 1,
      message: message.Body,
    };

    console.log(response);

    const exampleSocket = new WebSocket(
      "wss://0sj8dxqbz6.execute-api.us-east-1.amazonaws.com/production"
    );

    exampleSocket.onopen = (event) => {
      console.log("!");
      exampleSocket.send(JSON.stringify(response));
      exampleSocket.close();
    };
  },
  sqs: new SQSClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: "AKIA4WSZPNP52LY2IJDV",
      secretAccessKey: "MPnglkg4FVhEBJXTQjl4weU5WQFvYE6DvBWCKkDq",
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
