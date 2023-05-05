const superagent = require("superagent");
const path = require("path");
const fs = require("fs");
const {
  getConfigurationFile,
  dbQuery,
} = require("../../../common/config-utils");

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

    console.log("CREATING MIRROR:", {
      id: payload.id,
      urls: `https://${cdnConfig.public}`,
      amount: 1,
      fee: 300000000,
    });

    const response = await superagent
      .post(
        `https://${process.env.RPC_HOST}:${process.env.RPC_DATALAYER_PORT}/add_mirror`
      )
      .send({
        id: payload.id,
        urls: `https://${cdnConfig.public}`,
        amount: 1,
        fee: 300000000,
      })
      .set("Content-Type", "application/json")
      .key(fs.readFileSync(keyFile))
      .cert(fs.readFileSync(certFile));

    if (response.body.success) {
      await dbQuery(`
        INSERT INTO user_mirrors (user_id, singleton_id, name, active)
        VALUES (:userId, :singletonId, :name, true)
        ON DUPLICATE KEY UPDATE active = true;
      `,
        {
          userId: payload.userId,
          singletonId: payload.id,
          name: payload.name || "",
        }
      );
    }

    return response.body.success;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
};

module.exports = {
  createMirror,
};
