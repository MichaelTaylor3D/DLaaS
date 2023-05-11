const superagent = require("superagent");
const path = require("path");
const fs = require("fs");
const https = require("https");
const config = require("../../../common/config.json");

const { getChiaRoot } = require("../../utils");

const chiaRoot = getChiaRoot();
const certFile = path.resolve(
  `${chiaRoot}/config/ssl/data_layer/private_data_layer.crt`
);
const keyFile = path.resolve(
  `${chiaRoot}/config/ssl/data_layer/private_data_layer.key`
);

const walletIsSynced = async () => {
  let synced = false;

  while (!synced) {
    const response = await superagent
      .post(
        `https://${process.env.RPC_HOST}:${process.env.RPC_WALLET_PORT}/get_sync_status`
      )
      .set("Content-Type", "application/json")
      .send({})
      .key(fs.readFileSync(keyFile))
      .cert(fs.readFileSync(certFile))
      .agent(
        new https.Agent({
          rejectUnauthorized: false,
        })
      );

    const data = response.body;

    if (data.success) {
      synced = data.synced;
    }

    if (!synced) {
      // Wait for 10 seconds before checking the status again
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }

  return true;
};

const sendToDonationAddress = async (payload) => {
  try {
    console.log("SENDING TO: ", config.DONATION_ADDRESS, {
      wallet_id: "1",
      address: config.DONATION_ADDRESS,
      amount: payload.amountInMojos,
      fee: 6000000,
    });

    await walletIsSynced();

    const response = await superagent
      .post(
        `https://${process.env.RPC_HOST}:${process.env.RPC_WALLET_PORT}/send_transaction`
      )
      .send({
        wallet_id: "1",
        address: config.DONATION_ADDRESS,
        amount: payload.amountInMojos,
        fee: 6000000,
      })
      .set("Content-Type", "application/json")
      .key(fs.readFileSync(keyFile))
      .cert(fs.readFileSync(certFile))
      .agent(
        new https.Agent({
          rejectUnauthorized: false,
        })
      );

    console.log("response.body: ", response.body);

    return response.body.transactions;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
};

module.exports = {
  sendToDonationAddress,
};
