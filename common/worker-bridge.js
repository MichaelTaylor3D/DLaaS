const { getConfigurationFile } = require("./common");
const WebSocket = require("ws");

/**
 * Loads WebSocket configuration, sends a payload with the specified command, and returns the result.
 * @async
 * @param {string} command - The command to send to the WebSocket.
 * @param {Object} payload - The payload to send along with the command.
 * @returns {Promise<Object>} A promise that resolves with the received result from the WebSocket.
 */
async function sendChiaRPCCommand(command, payload = {}) {
  const config = await getConfigurationFile("websocket.config.json");

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(config.websocket_url);

    ws.on("open", () => {
      ws.send(JSON.stringify({ cmd: command, payload }));
    });

    ws.on("message", (message) => {
      const result = JSON.parse(message);
      resolve(result);
      ws.close();
    });

    ws.on("error", (error) => {
      reject(error);
    });
  });
}

module.exports = {
  sendChiaRPCCommand,
};
