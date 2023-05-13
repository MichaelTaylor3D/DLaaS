const {
  dbQuery,
  sendEmailWithTemplate,
  getConfigurationFile,
  sendChiaRPCCommand,
  rpc,
} = require("/opt/nodejs/common");

const config = require("/opt/nodejs/common/config.json");

// Create the Lambda handler
exports.handler = async (event, context) => {
  // Get the current date and subtract grace period days
  const gracePeriodEndDate = new Date();
  gracePeriodEndDate.setDate(
    gracePeriodEndDate.getDate() - config.SUBSCRIPTION_GRACE_PERIOD_IN_DAYS
  );

  // Query to get all subscriptions that have ended more than grace period days ago and are still marked as 'expired'
  const subscriptions = await dbQuery(
    `SELECT * FROM subscriptions WHERE end_date < :gracePeriodEndDate AND status = 'expired';`,
    { gracePeriodEndDate }
  );

  // Fetch the product configurations
  const products = await getConfigurationFile("products.config.json");

  // For each subscription...
  for (let subscription of subscriptions) {
    // Get the product configuration for the subscription
    const product = products[subscription.product_key];

    // Revert the subscription
    await sendChiaRPCCommand(rpc[product.revert_cmd], {
      subscriptionId: subscription.id,
      ...subscription.data,
    });

    // Update the subscription status to 'terminated'
    await dbQuery(
      `UPDATE subscriptions SET status = 'terminated' WHERE id = :id;`,
      { id: subscription.id }
    );

    // Get the latest invoice for the subscription
    const [latestInvoice] = await dbQuery(
      `SELECT * FROM invoices WHERE subscription_id = :subscriptionId ORDER BY issue_date DESC LIMIT 1;`,
      { subscriptionId: subscription.id }
    );

    // If an invoice was found, set its status to 'expired'
    if (latestInvoice) {
      await dbQuery(
        `UPDATE invoices SET status = 'expired' WHERE guid = :invoiceId;`,
        { invoiceId: latestInvoice.guid }
      );
    }

    // Get the user's email
    const user = await dbQuery(`SELECT email FROM users WHERE id = :userId;`, {
      userId: subscription.user_id,
    });

    // Send the termination email to the user
    await sendEmailWithTemplate({
      email: user[0].email,
      subject: `Your ${config.SERVICE_NAME} Subscription - Important Information Regarding Service Changes`,
      template: "subscription-terminated.handlebars",
      values: {
        serviceName: config.SERVICE_NAME,
      },
    });
  }
};
