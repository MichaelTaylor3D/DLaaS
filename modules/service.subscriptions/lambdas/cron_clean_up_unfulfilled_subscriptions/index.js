const { dbQuery, sendEmail } = require("/opt/nodejs/common");

const getExpiredInvoicesAndSubscriptions = async () => {
  const result = await dbQuery(`
    SELECT
      i.id as invoice_id,
      s.id as subscription_id,
      u.email as email,
      u.username as username
    FROM invoices i
    JOIN subscriptions s ON i.id = s.invoice_id
    JOIN users u ON u.id = s.user_id
    WHERE i.issue_date < DATE_SUB(NOW(), INTERVAL 30 DAY)
  `);

  return result;
};

const deleteInvoiceById = async (invoice_id) => {
  await dbQuery("DELETE FROM invoices WHERE id = :invoice_id", { invoice_id });
};

const deleteSubscriptionById = async (subscription_id) => {
  await dbQuery("DELETE FROM subscriptions WHERE id = :subscription_id", {
    subscription_id,
  });
};

const notifyUser = async (email, username) => {
  const subject = "Subscription Cancelled Due to Unpaid Invoice";
  const message = `Dear ${username},\n\nYour subscription has been cancelled due to an unpaid invoice that was issued over 30 days ago. Please contact our support team if you have any questions.\n\nRegards,\nDLaaS Support Team`;

  await sendEmail(email, subject, message);
};

const notifyAndDeleteInvoicesAndSubscriptions = async () => {
  const expiredInvoicesAndSubscriptions =
    await getExpiredInvoicesAndSubscriptions();

  for (const {
    invoice_id,
    subscription_id,
    email,
    username,
  } of expiredInvoicesAndSubscriptions) {
    await Promise.all([
      deleteInvoiceById(invoice_id),
      deleteSubscriptionById(subscription_id),
      notifyUser(email, username),
    ]);
  }
};

exports.handler = async (event) => {
  try {
    await notifyAndDeleteInvoicesAndSubscriptions();
    console.log("Successfully processed expired invoices and subscriptions.");
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};
