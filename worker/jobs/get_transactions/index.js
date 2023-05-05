const superagent = require("superagent");
const path = require("path");
const fs = require("fs");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const { getChiaRoot } = require("../../utils");

const getTransactions = async (payload) => {
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
        `https://${process.env.RPC_HOST}:${process.env.RPC_WALLET_PORT}/get_transactions`
      )
      .send({ wallet_id: 1, to_address: payload.address })
      .set("Content-Type", "application/json")
      .key(fs.readFileSync(keyFile))
      .cert(fs.readFileSync(certFile));

    console.log('response.body: ', response.body);

    return response.body.transactions;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

module.exports = {
  getTransactions,
};
