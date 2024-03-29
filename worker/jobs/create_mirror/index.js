const superagent = require("superagent");
const path = require("path");
const fs = require("fs");
const https = require("https");
const {
  getConfigurationFile,
  dbQuery,
  sendEmailWithTemplate,
  generateSalt,
  generateStoreUploadKey,
} = require("../../../common");

const config = require("../../../common/config.json");

const { getChiaRoot, getFilesBySubstring } = require("../../utils");
const { uploadFileToS3 } = require("../upload_file_to_s3");
const chiaRoot = getChiaRoot();
const certFile = path.resolve(
  `${chiaRoot}/config/ssl/data_layer/private_data_layer.crt`
);
const keyFile = path.resolve(
  `${chiaRoot}/config/ssl/data_layer/private_data_layer.key`
);

const createMirror = async (payload) => {
  try {
    const cdnConfig = await getConfigurationFile("cdn.config.json");

    const salt = await generateSalt(24);
    const mirrorUrl = `https://${cdnConfig.public}/${generateStoreUploadKey(
      payload.id,
      salt
    )}`;

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

    console.log("CREATING MIRROR:", {
      id: payload.id,
      urls: [mirrorUrl],
      amount: 1,
      fee: 300000000,
    });

    const addMirrorResponse = await superagent
      .post(
        `https://${process.env.RPC_HOST}:${process.env.RPC_DATALAYER_PORT}/add_mirror`
      )
      .send({
        id: payload.id,
        urls: [mirrorUrl],
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

    console.log({
      userId: payload.userId,
      singletonId: payload.id,
      name: payload.name || "",
      subscriptionId: payload.subscriptionId || "",
      permissionedFor: payload.permissioned_for.join(",") || "All",
    });

    await dbQuery(
      `
      INSERT INTO user_mirrors (user_id, singleton_id, name, subscription_id, active, salt, permissioned_for)
      VALUES (:userId, :singletonId, :name, :subscriptionId, true, :salt, JSON_ARRAY(:permissionedFor))
      ON DUPLICATE KEY UPDATE active = true;
    `,
      {
        userId: payload.userId,
        singletonId: payload.id,
        name: payload.name || "",
        subscriptionId: payload.subscriptionId || "",
        salt,
        permissionedFor: payload.permissioned_for.join(",") || "All",
      }
    );

    const user = await dbQuery("SELECT * FROM users WHERE id = :userId", {
      userId: payload.userId,
    });

    if (user[0].email) {
      sendEmailWithTemplate({
        email: user[0].email,
        subject: "Your Mirror is being created",
        template: "mirror-activation.handlebars",
        values: {
          serviceName: config.SERVICE_NAME,
          mirrorUrl,
        },
      });
    }

    const previouslyExistingFiles = await getFilesBySubstring(payload.id);

    previouslyExistingFiles.forEach((file) => {
      uploadFileToS3({ store_id: payload.id, file });
    });

    return true;
  } catch (error) {
    console.trace(error.message);

    const user = await dbQuery("SELECT * FROM users WHERE id = :userId", {
      userId: payload.userId,
    });

    if (user[0].email) {
      if (error.message === "Subscription failed") {
        sendEmailWithTemplate({
          email: user[0].email,
          subject: "Mirror Creation Failed",
          template: "mirror-failed-invalid-storeid.handlebars",
          values: {
            serviceName: config.SERVICE_NAME,
            storeId: payload.id,
          },
        });
      } else if (error.message === "Creating mirror failed") {
        sendEmailWithTemplate({
          email: user[0].email,
          subject: "Mirror Creation Failed",
          template: "mirror-failed-general-error.handlebars",
          values: {
            serviceName: config.SERVICE_NAME,
            storeId: payload.id,
          },
        });
      } else if (error.message === "Mirror already exists.") {
        console.log(error.message);
      }
    }
  }
};

module.exports = {
  createMirror,
};
