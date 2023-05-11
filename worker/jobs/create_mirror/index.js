const superagent = require("superagent");
const path = require("path");
const fs = require("fs");
const https = require("https");
const { getConfigurationFile, dbQuery, sendEmail } = require("../../../common");

const { getChiaRoot } = require("../../utils");

const chiaRoot = getChiaRoot();
const certFile = path.resolve(
  `${chiaRoot}/config/ssl/data_layer/private_data_layer.crt`
);
const keyFile = path.resolve(
  `${chiaRoot}/config/ssl/data_layer/private_data_layer.key`
);

const getMirrors = async (payload) => {
  const getMirrorsResponse = await superagent
    .post(
      `https://${process.env.RPC_HOST}:${process.env.RPC_DATALAYER_PORT}/get_mirrors`
    )
    .set("Content-Type", "application/json")
    .send({ id: payload.id })
    .key(fs.readFileSync(keyFile))
    .cert(fs.readFileSync(certFile))
    .agent(
      new https.Agent({
        rejectUnauthorized: false,
      })
    );

  return getMirrorsResponse.body;
};

const createMirror = async (payload) => {
  try {
    const cdnConfig = await getConfigurationFile("cdn.config.json");

    const mirrorResults = await getMirrors(payload);
    const mirrorUrl = `https://${cdnConfig.public}/${payload.id}`;

    const existingMirror = mirrorResults?.mirrors?.find((mirror) =>
      mirror.urls.includes(mirrorUrl)
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
      .cert(fs.readFileSync(certFile))
      .agent(
        new https.Agent({
          rejectUnauthorized: false,
        })
      );

    if (!subscribeResponse.body.success) {
      throw new Error("Subscription failed");
    }

    if (!existingMirror) {
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
        .cert(fs.readFileSync(certFile))
        .agent(
          new https.Agent({
            rejectUnauthorized: false,
          })
        );

      if (!addMirrorResponse.body.success) {
        throw new Error("Creating mirror failed");
      }
    }

    console.log({
      userId: payload.userId,
      singletonId: payload.id,
      name: payload.name || "",
      subscriptionId: payload.subscriptionId || "",
    });

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
        `Your mirror is now active. It is being served from https://${cdnConfig.public}/${payload.id}. <br />
         Thank you for your business.`
      );
    }

    return true;
  } catch (error) {
    console.trace(error.message);

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
      } else if (error.message === "Mirror already exists.") {
        console.log(error.message);
      }
    }
  }
};

module.exports = {
  createMirror,
};
