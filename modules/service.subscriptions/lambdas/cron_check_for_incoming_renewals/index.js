const {
  sendEmailWithTemplate,
  getUserBy,
  dbQuery,
  getConfigurationFile,
} = require("/opt/nodejs/common");

const config = require("/opt/nodejs/common/config.json");

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Fetch the subscriptions whose end_date is within grace period days in future.
    const subscriptions = await dbQuery(`
      SELECT * FROM subscriptions WHERE DATE_ADD(end_date, INTERVAL :gracePeriod DAY) > NOW() AND status = 'active';
    `, { gracePeriod: config.SUBSCRIPTION_GRACE_PERIOD_IN_DAYS });

    // Load the product configurations.
    const products = await getConfigurationFile("products.config.json");

    for (let subscription of subscriptions) {
      // Get the product details.
      const product = products[subscription.product_key];

      // Create a new invoice for the subscription.
      const invoice = await createInvoice(
        subscription.user_id,
        subscription.id,
        product
      );

      // Get the user's email address.
      const user = await getUserBy("id", subscription.user_id);

      // Get the service domain from the app.config.json file.
      const appConfig = await getConfigurationFile("app.config.json");
      const serviceDomain = appConfig.SERVICE_DOMAIN;

      // Generate the invoice URL.
      const invoiceUrl = `https://app.${serviceDomain}/invoices/${invoice.id}`;

      // Send the renewal email to the user.
    await sendEmailWithTemplate({
      email: user.email,
      subject: `${appConfig.SERVICE_NAME} Subscription - Upcoming Renewal`,
      template: "subscription-renewal.handlebars",
      values: {
        serviceName: appConfig.SERVICE_NAME,
        product: product,
        invoiceUrl: invoiceUrl,
        gracePeriod: config.SUBSCRIPTION_GRACE_PERIOD_IN_DAYS,
      },
    });
    }

    return { statusCode: 200, body: "Subscription renewal emails sent." };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: "Error in processing subscriptions." };
  }
};
