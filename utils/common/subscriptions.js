const mysql = require("mysql");
const AWS = require("aws-sdk");

async function createSubscription(userId, productKey) {
  return new Promise(async (resolve, reject) => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);

    const queryString = `
      INSERT INTO subscriptions (user_id, product_key, start_date, end_date, status)
      VALUES (?, ?, ?, ?, 'pending');
    `;
    const queryValues = [userId, productKey, startDate, endDate];

    db.query(queryString, queryValues, async (error, result) => {
      if (error) {
        console.error("Error creating subscription:", error);
        reject(error);
        return;
      }

      const subscriptionId = result.insertId;
      console.log(`Subscription created with ID: ${subscriptionId}`);

      try {
        const invoice = await createInvoice(subscriptionId);
        const email = "user@example.com"; // Replace this with the user's email address
        const invoiceUrl = `https://example.com/invoices/${invoice.guid}`;

        await sendEmail(
          email,
          "Your New Subscription Invoice",
          `Please pay the invoice at ${invoiceUrl} to activate your subscription.`
        );

        console.log(`Invoice email sent to user ID: ${userId}`);
        resolve(subscriptionId);
      } catch (error) {
        console.error("Error creating invoice or sending email:", error);
        reject(error);
      }
    });
  });
}

async function createInvoice(subscriptionId) {
  return new Promise(async (resolve, reject) => {
    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(issueDate.getDate() + 15);
    const amount = 100; // Replace this with the actual subscription amount
    const xchPaymentAddress = "xch1exampleaddress"; // Replace this with the actual XCH payment address

    const queryString = `
      INSERT INTO invoices (subscription_id, issue_date, due_date, amount, xch_payment_address, status)
      VALUES (?, ?, ?, ?, ?, 'unpaid');
    `;
    const queryValues = [
      subscriptionId,
      issueDate,
      dueDate,
      amount,
      xchPaymentAddress,
    ];

    db.query(queryString, queryValues, async (error, result) => {
      if (error) {
        console.error("Error creating invoice:", error);
        reject(error);
        return;
      }

      const invoiceId = result.insertId;
      console.log(`Invoice created with ID: ${invoiceId}`);

      const getInvoiceQueryString = `
        SELECT i.*, u.email FROM invoices i
        JOIN subscriptions s ON i.subscription_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE i.id = ?;
      `;
      db.query(getInvoiceQueryString, [invoiceId], async (error, rows) => {
        if (error || rows.length === 0) {
          console.error("Error fetching invoice:", error);
          reject(error);
        } else {
          const invoice = rows[0];
          console.log(`Invoice GUID: ${invoice.guid}`);

          const invoiceUrl = `https://example.com/invoices/${invoice.guid}`;
          await sendEmail(
            invoice.email,
            "Your Invoice",
            `Please pay the invoice at ${invoiceUrl} to activate or renew your subscription.`
          );
          console.log(`Invoice email sent to user: ${invoice.email}`);

          resolve(invoice);
        }
      });
    });
  });
}

// assumes that the payment 
// verification with the Chia blockchain is done outside of this function. 
async function confirmPayment(guid, transactionHash) {
  return new Promise(async (resolve, reject) => {
    const updateInvoiceQueryString = `
      UPDATE invoices
      SET status = 'paid', transaction_hash = ?
      WHERE guid = ?;
    `;
    const updateInvoiceQueryValues = [transactionHash, guid];

    db.query(
      updateInvoiceQueryString,
      updateInvoiceQueryValues,
      async (error, result) => {
        if (error) {
          console.error("Error updating invoice:", error);
          reject(error);
          return;
        }

        if (result.affectedRows === 0) {
          console.error("No invoice found with the provided GUID");
          reject(new Error("No invoice found with the provided GUID"));
          return;
        }

        console.log(`Invoice with GUID: ${guid} marked as paid.`);

        const getSubscriptionQueryString = `
        SELECT s.* FROM subscriptions s
        JOIN invoices i ON s.id = i.subscription_id
        WHERE i.guid = ?;
      `;
        db.query(getSubscriptionQueryString, [guid], async (error, rows) => {
          if (error || rows.length === 0) {
            console.error("Error fetching subscription:", error);
            reject(error);
          } else {
            const subscription = rows[0];

            const updateSubscriptionQueryString = `
            UPDATE subscriptions
            SET status = 'active'
            WHERE id = ?;
          `;
            db.query(
              updateSubscriptionQueryString,
              [subscription.id],
              (error, result) => {
                if (error) {
                  console.error("Error updating subscription:", error);
                  reject(error);
                } else {
                  console.log(
                    `Subscription ID: ${subscription.id} marked as active.`
                  );
                  resolve(subscription.id);
                }
              }
            );
          }
        });
      }
    );
  });
}

async function checkSubscriptionsForExpiration() {
  return new Promise(async (resolve, reject) => {
    const currentDate = new Date();
    const expirationDate = new Date(currentDate);
    expirationDate.setDate(currentDate.getDate() + 15);

    const queryString = `
      SELECT s.*, u.email FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'active' AND s.end_date BETWEEN ? AND ?;
    `;
    const queryValues = [currentDate, expirationDate];

    db.query(queryString, queryValues, async (error, rows) => {
      if (error) {
        console.error("Error fetching subscriptions:", error);
        reject(error);
        return;
      }

      console.log(`Found ${rows.length} subscriptions expiring soon.`);
      const invoicePromises = rows.map(async (subscription) => {
        try {
          const invoice = await createInvoice(subscription.id);
          const invoiceUrl = `https://example.com/invoices/${invoice.guid}`;

          await sendEmail(
            subscription.email,
            "Your Subscription Is Expiring Soon",
            `Your subscription is expiring soon. Please pay the invoice at ${invoiceUrl} to renew your subscription.`
          );

          console.log(`Invoice email sent to user ID: ${subscription.user_id}`);
        } catch (error) {
          console.error("Error creating invoice or sending email:", error);
        }
      });

      await Promise.all(invoicePromises);
      resolve();
    });
  });
}

async function renewSubscription(subscriptionId) {
  return new Promise(async (resolve, reject) => {
    const getSubscriptionQueryString = `
      SELECT * FROM subscriptions
      WHERE id = ?;
    `;
    db.query(getSubscriptionQueryString, [subscriptionId], (error, rows) => {
      if (error || rows.length === 0) {
        console.error("Error fetching subscription:", error);
        reject(error);
        return;
      }

      const subscription = rows[0];

      if (subscription.status === "terminated") {
        console.error("Cannot renew a terminated subscription");
        reject(new Error("Cannot renew a terminated subscription"));
        return;
      }

      const newEndDate = new Date(subscription.end_date);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);

      const updateSubscriptionQueryString = `
        UPDATE subscriptions
        SET end_date = ?
        WHERE id = ?;
      `;
      const updateSubscriptionQueryValues = [newEndDate, subscriptionId];

      db.query(
        updateSubscriptionQueryString,
        updateSubscriptionQueryValues,
        (error, result) => {
          if (error) {
            console.error("Error renewing subscription:", error);
            reject(error);
            return;
          }

          console.log(`Subscription ID: ${subscriptionId} renewed.`);
          resolve({
            ...subscription,
            end_date: newEndDate,
          });
        }
      );
    });
  });
}

async function terminateSubscription(subscriptionId) {
  return new Promise(async (resolve, reject) => {
    const getSubscriptionQueryString = `
      SELECT * FROM subscriptions
      WHERE id = ?;
    `;
    db.query(getSubscriptionQueryString, [subscriptionId], (error, rows) => {
      if (error || rows.length === 0) {
        console.error("Error fetching subscription:", error);
        reject(error);
        return;
      }

      const subscription = rows[0];

      const updateSubscriptionQueryString = `
        UPDATE subscriptions
        SET status = 'terminated'
        WHERE id = ?;
      `;
      const updateSubscriptionQueryValues = [subscriptionId];

      db.query(
        updateSubscriptionQueryString,
        updateSubscriptionQueryValues,
        (error, result) => {
          if (error) {
            console.error("Error terminating subscription:", error);
            reject(error);
            return;
          }

          console.log(`Subscription ID: ${subscriptionId} terminated.`);
          resolve({
            ...subscription,
            status: "terminated",
          });
        }
      );
    });
  });
}

const gracePeriodDays = 15;

async function setSubscriptionsToGracePeriod() {
  return new Promise(async (resolve, reject) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const queryString = `
      SELECT s.*, u.email FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'active' AND s.end_date = ?;
    `;
    const queryValues = [currentDate];

    db.query(queryString, queryValues, async (error, rows) => {
      if (error) {
        console.error("Error fetching subscriptions:", error);
        reject(error);
        return;
      }

      console.log(`Found ${rows.length} subscriptions that expired today.`);

      if (rows.length === 0) {
        resolve(0);
        return;
      }

      const updateSubscriptionQueryString = `
        UPDATE subscriptions
        SET status = 'grace_period'
        WHERE id IN (?);
      `;
      const subscriptionIds = rows.map((subscription) => subscription.id);

      db.query(
        updateSubscriptionQueryString,
        [subscriptionIds],
        async (error, result) => {
          if (error) {
            console.error(
              "Error setting subscriptions to grace_period:",
              error
            );
            reject(error);
            return;
          }

          console.log(
            `${result.affectedRows} subscriptions set to grace_period.`
          );

          // Send emails to users
          const emailPromises = rows.map(async (subscription) => {
            try {
              await sendEmail(
                subscription.email,
                "Your Subscription Has Expired",
                `Your subscription has expired. You have a grace period of ${gracePeriodDays} days to renew your subscription.`
              );

              console.log(
                `Grace period email sent to user ID: ${subscription.user_id}`
              );
            } catch (error) {
              console.error("Error sending grace period email:", error);
            }
          });

          await Promise.all(emailPromises);
          resolve(result.affectedRows);
        }
      );
    });
  });
}
