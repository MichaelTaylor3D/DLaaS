"use strict";

const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const {
  getConfigurationFile,
  assertBearerTokenOrBasicAuth,
  assertRequiredBodyParams,
} = require("./common");

const recordMirrorToUser = async (userId, singletonId, singletonName) => {
  return dbQuery(
    `UPDATE user_mirrors SET user_id = :userId, singleton_id = :singletonId, name = :singletonName`,
    {
      userId,
      singletonId,
      singletonName,
    }
  );
};

const sendCommand = () => {
  return new Promise(async (resolve, reject) => {
    const [wsConfig, commands] = await Promise.all([
      getConfigurationFile("websocket.config.json"),
      getConfigurationFile("commands.enum.json"),
    ]);

    const socket = new WebSocket(wsConfig.websocket_url);

    socket.addEventListener("open", (event) => {
      socket.send(
        JSON.stringify({
          MessageGroupId: uuidv4(),
          data: {
            command: commands.CREATE_MIRROR,
            data: { storeId },
          },
        })
      );
    });

    socket.addEventListener("message", async (event) => {
      const data = JSON.parse(event.data);
      if (data.success) {
        socket.close(data);
        resolve();
      } else {
        reject("Mirror creation failed.");
      }
    });
  });
};

exports.handler = async (event, context, callback) => {
  try {
    await assertBearerTokenOrBasicAuth(event?.headers?.Authorization);

    const requestBody = JSON.parse(event.body);
    const {store_id: storeId, name: mirrorName} = await assertRequiredBodyParams(requestBody, ['store_id', 'name']);

    await sendCommand();

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: "Mirror has been created successfully.",
      }),
    });
  } catch (error) {
    socket.close();
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: error.message,
      }),
    });
  }
};
