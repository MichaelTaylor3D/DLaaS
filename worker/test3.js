const WebSocket = require("ws");

const send = () => {
  return new Promise((resolve) => {
    const exampleSocket = new WebSocket(
      "wss://0sj8dxqbz6.execute-api.us-east-1.amazonaws.com/production"
    );

    exampleSocket.onopen = (event) => {
      console.log("WebSocket connection opened:");
      const response = {
        MessageGroupId: 1,
        requestId: 1,
        message: JSON.stringify({ cmd: "getNewPaymentAddress" }),
      };
      exampleSocket.send(JSON.stringify(response));
    };

    exampleSocket.onmessage = (event) => {
      console.log("Received message from WebSocket:", event.data);

      // Process the received message
      // ...

      // Close the WebSocket connection after processing the message
      exampleSocket.close();
      resolve(event.data);
    };

    exampleSocket.onerror = (event) => {
      console.error("WebSocket error:", event);
      exampleSocket.close();
    };

    exampleSocket.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
    };
  });
};

const start = async () => {
  await send();
};

start();
