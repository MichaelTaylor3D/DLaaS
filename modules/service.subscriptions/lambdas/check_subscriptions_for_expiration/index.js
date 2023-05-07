const { dbQuery } = require("./common/db");
const { sendEmail } = require("./common/email");
const { getConfigurationFile } = require("./common/utils");
const { sendChiaRPCCommand, rpc } = require("./common/chia");

async function updateExpiredSubscriptionsAndGetDetails() {
  const queryString = `
    SELECT s.id as subscription_id, u.id as user_id, u.username, u.email, s.product_key
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    WHERE s.end_date < NOW() AND s.status != 'expired';
  `;

  const expiredSubscriptions = await dbQuery(queryString);

  const expiredSubscriptionsDetails = [];
  for (const row of expiredSubscriptions) {
    const { user_id, subscription_id, username, email, product_key } = row;

    // Load the products configuration
    const productsConfig = await getConfigurationFile("products.config.json");
    const product = productsConfig[product_key];

    if (!product) {
      console.error("Product not found for subscription:", subscription_id);
      continue;
    }

    try {
      // Create a new invoice for the expired subscription
      const invoice = await createInvoice(user_id, subscription_id, product);
      const invoiceId = invoice.id;

      expiredSubscriptionsDetails.push({
        user_id,
        subscription_id,
        username,
        email,
        invoice_id: invoiceId,
      });
    } catch (error) {
      console.error("Error creating invoice for subscription:", error);
    }
  }

  return expiredSubscriptionsDetails;
}

async function setExpiredAndDeactivateMirror(subscriptionId, singletonId) {
  const updateSubscriptionStatus = `
    UPDATE subscriptions
    SET status = 'expired'
    WHERE id = :subscriptionId;
  `;
  await dbQuery(updateSubscriptionStatus, { subscriptionId });

  const deactivateMirror = `
    UPDATE user_mirrors
    SET active = false
    WHERE singleton_id = :singletonId;
  `;
  await dbQuery(deactivateMirror, { singletonId });
}

async function notifyUser(email, username, invoiceId) {
  const appConfig = await getConfigurationFile("app.config.json");
  const serviceDomain = appConfig.SERVICE_DOMAIN;
  const invoiceUrl = `https://app.${serviceDomain}/invoices/${invoiceId}`;

  await sendEmail(
    email,
    "Your Subscription Has Expired",
    `Dear ${username},\n\nYour subscription has expired due to non-payment. To resume services, please pay the invoice at ${invoiceUrl}. If you have any questions or concerns, please contact our support team.\n\nThank you.`,
    `Dear ${username},<br><br>Your subscription has expired due to non-payment. To resume services, please pay the invoice at <a href="${invoiceUrl}">${invoiceUrl}</a>. If you have any questions or concerns, please contact our support team.<br><br>Thank you.`
  );
}

exports.handler = async (event, context, callback) => { 
  try {
    const expiredSubscriptionsDetails =
      await updateExpiredSubscriptionsAndGetDetails();

    for (const detail of expiredSubscriptionsDetails) {
      const { user_id, subscription_id, username, email, invoice_id } = detail;

      const mirror = await dbQuery(
        "SELECT singleton_id FROM user_mirrors WHERE user_id = :userId AND active = true;",
        { userId: user_id }
      );

      if (mirror.length === 0) {
        console.error(`No active mirror found for user ID: ${user_id}`);
        continue;
      }

      const singletonId = mirror[0].singleton_id;

      await Promise.all([
        setExpiredAndDeactivateMirror(subscription_id, singletonId),
        sendChiaRPCCommand(rpc.DELETE_MIRROR, { address: singletonId }),
        notifyUser(email, username, invoice_id),
      ]);
    }

    console.log("Expired subscriptions processed successfully.");
  } catch (error) {
    console.error("Error processing expired subscriptions:", error);
  }
};
