const { getConfigurationFile } = require("../common/config-utils");
const WebSocket = require("ws");

/**
 * Loads WebSocket configuration, sends a payload with the specified command, and returns the result.
 * @async
 * @param {string} command - The command to send to the WebSocket.
 * @param {Object} payload - The payload to send along with the command.
 * @returns {Promise<Object>} A promise that resolves with the received result from the WebSocket.
 */
async function sendChiaRPCCommand(command, payload = {}) {
  console.log('sendChiaRPCCommand')
  const config = await getConfigurationFile("websocket.config.json");
  console.log(config.websocket_url);

  return new Promise((resolve, reject) => {
    console.log('new WebSocket')
    const ws = new WebSocket(config.websocket_url);

    ws.on("open", () => {
      console.log('open');
      ws.send(JSON.stringify({ cmd: command, payload }));
    });

    ws.on("message", (message) => {
      console.log('message');
      const result = JSON.parse(message);
      resolve(result);
      ws.close();
    });

    ws.on("error", (error) => {
      reject(error);
    });
  });
}

const send = async (command) => {
  const result = await sendChiaRPCCommand("getNewPaymentAddress");
  console.log(result);
}

send();
