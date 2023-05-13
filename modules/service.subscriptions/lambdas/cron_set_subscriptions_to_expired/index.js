const {
  dbQuery,
  sendEmailWithTemplate,
} = require("/opt/nodejs/common");

const config = require("/opt/nodejs/common/config.json");

exports.handler = async (event, context) => {
  const expiredSubscriptions = await dbQuery(
    `SELECT * FROM subscriptions WHERE end_date < NOW() AND status NOT IN ('expired', 'terminated')`
  );

  for (const subscription of expiredSubscriptions) {
    await dbQuery(
      `UPDATE subscriptions SET status = 'expired' WHERE id = :id`,
      { id: subscription.id }
    );

    const [user] = await dbQuery(`SELECT * FROM users WHERE id = :id`, {
      id: subscription.user_id,
    });

    const [invoice] = await dbQuery(
      `SELECT * FROM invoices WHERE subscription_id = :id ORDER BY due_date DESC LIMIT 1`,
      { id: subscription.id }
    );

    const invoiceUrl = `https://app.${config.SERVICE_DOMAIN}/invoices/${invoice.guid}`;

    await sendEmailWithTemplate({
      email: user.email,
      subject: `${config.SERVICE_NAME} Subscription Expired`,
      template: "subscription-expired.handlebars",
      values: {
        serviceName: config.SERVICE_NAME,
        userName: user.name,
        gracePeriodEnds: new Date(
          Date.now() +
            config.SUBSCRIPTION_GRACE_PERIOD_IN_DAYS * 24 * 60 * 60 * 1000
        ),
        invoiceUrl: invoiceUrl,
      },
    });
  }
};
