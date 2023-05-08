const superagent = require("superagent");
const path = require("path");
const fs = require("fs");
const {
  getConfigurationFile,
  dbQuery,
  sendEmail
} = require("../../../common");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const { getChiaRoot } = require("../../utils");

const createMirror = async (payload) => {
  try {
    const cdnConfig = await getConfigurationFile("cdn.config.json");

    const chiaRoot = getChiaRoot();
    const certFile = path.resolve(
      `${chiaRoot}/config/ssl/data_layer/private_data_layer.crt`
    );
    const keyFile = path.resolve(
      `${chiaRoot}/config/ssl/data_layer/private_data_layer.key`
    );

    console.log("SUBSCRIBING:", { id: payload.id });

    const subscribeResponse = await superagent
      .post(
        `https://${process.env.RPC_HOST}:${process.env.RPC_DATALAYER_PORT}/subscribe`
      )
      .send({
        id: payload.id,
      })
      .set("Content-Type", "application/json")
      .key(fs.readFileSync(keyFile))
      .cert(fs.readFileSync(certFile));

    if (!subscribeResponse.body.success) {
      throw new Error("Subscription failed");
    }

    console.log("CREATING MIRROR:", {
      id: payload.id,
      urls: [`https://${cdnConfig.public}/${payload.id}`],
      amount: 1,
      fee: 300000000,
    });

    const addMirrorResponse = await superagent
      .post(
        `https://${process.env.RPC_HOST}:${process.env.RPC_DATALAYER_PORT}/add_mirror`
      )
      .send({
        id: payload.id,
        urls: [`https://${cdnConfig.public}/${payload.id}`],
        amount: 1,
        fee: 300000000,
      })
      .set("Content-Type", "application/json")
      .key(fs.readFileSync(keyFile))
      .cert(fs.readFileSync(certFile));

    if (!addMirrorResponse.body.success) {
      throw new Error("Creating mirror failed");
    }

    await dbQuery(
      `
      INSERT INTO user_mirrors (user_id, singleton_id, name, subscription_id, active)
      VALUES (:userId, :singletonId, :name, :subscriptionId, true)
      ON DUPLICATE KEY UPDATE active = true;
    `,
      {
        userId: payload.userId,
        singletonId: payload.id,
        name: payload.name || "",
        subscriptionId: payload.subscriptionId || "",
      }
    );

    const user = await dbQuery("SELECT * FROM users WHERE id = :userId", {
      userId: payload.userId,
    });

    if (user[0].email) {
      sendEmail(
        user[0].email,
        "Mirror Created",
        `Your mirror is now active. It is being served from https://${cdnConfig.public}/${payload.id}. <br /> Thank you for your business.`
      );
    }

    return addMirrorResponse.body.success;
  } catch (error) {
    console.error("Error:", error.message);

    const user = await dbQuery("SELECT * FROM users WHERE id = :userId", {
      userId: payload.userId,
    });

    if (user[0].email) {
      if (error.message === "Subscription failed") {
        sendEmail(
          user[0].email,
          "Mirror Creation Failed",
          `We couldn't create the mirror because the provided storeId is not available. Please check the storeId and try again.`
        );
      } else if (error.message === "Creating mirror failed") {
        sendEmail(
          user[0].email,
          "Mirror Creation Failed",
          `We encountered an issue while creating the mirror. Please try again later or contact support for assistance.`
        );
      }
    }

    throw error;
  }
};

module.exports = {
  createMirror,
};
