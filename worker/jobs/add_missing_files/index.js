const superagent = require("superagent");
const path = require("path");
const fs = require("fs");
const https = require("https");

const { getChiaRoot } = require("../../utils");

const add_missing_files = async () => {
  try {
    const chiaRoot = getChiaRoot();
    const certFile = path.resolve(
      `${chiaRoot}/config/ssl/data_layer/private_data_layer.crt`
    );
    const keyFile = path.resolve(
      `${chiaRoot}/config/ssl/data_layer/private_data_layer.key`
    );

    const response = await superagent
      .post(
        `https://${process.env.RPC_HOST}:${process.env.RPC_DATALAYER_PORT}/add_missing_files`
      )
      .send({})
      .set("Content-Type", "application/json")
      .key(fs.readFileSync(keyFile))
      .cert(fs.readFileSync(certFile))
      .agent(
        new https.Agent({
          rejectUnauthorized: false,
        })
      );

    console.log('response.body: ', response.body);

    return response.body.transactions;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

module.exports = {
  add_missing_files,
};
