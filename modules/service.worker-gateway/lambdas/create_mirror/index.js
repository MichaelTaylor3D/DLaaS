"use strict";

const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const { getConfigurationFile, hashWithSalt, dbQuery } = require("./utils");

const getSaveHashForAccessKey = async (accessKey) => {
  return dbQuery(
    `SELECT user_id, access_key_hash FROM access_keys WHERE access_key = :access_key`,
    {
      accessKey,
    }
  );
};

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
    //  const auth = event?.headers?.Authorization.split(" ");
    //  if (auth?.[0].toLowerCase() !== "basic") {
    //    throw new Error("Missing client credentials.");
    //  }

    //  const [accessKey, secretAccessKey] = Buffer.from(auth[1], "base64")
    //    .toString("utf-8")
    //     .split(":");

    //  const { hash } = await hashWithSalt(accessKey, secretAccessKey);
    //  const [saveHashResult] = await getSaveHashForAccessKey(accessKey);

    //  if (saveHashResult.access_key_hash !== hash) {
    //    throw new Error("Invalid access key.");
    //   }

    //  const requestBody = JSON.parse(event.body);
    //  const storeId = requestBody?.store_id;

    // if (!storeId) {
    //    throw new Error("store_id is required.");
    //  }

    //  const mirrorName = requestBody?.name;

    //  if (!mirrorName) {
    //    throw new Error("name is required.");
    // }

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
