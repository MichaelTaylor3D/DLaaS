/**
 * @fileoverview A module for managing subscriptions and invoices. It provides functions to create, renew,
 * and terminate subscriptions, create invoices, confirm payments, and check subscription expiration.
 * The module also sends emails to users for various events, such as subscription expiration or invoice creation.
 */
const { getConfigurationFile } = require("./config-utils");
const { sendEmail } = require("./email-utils");
const { getUserBy, dbQuery } = require("./database-utils");
const { sendChiaRPCCommand } = require("./worker-bridge");
const rpc = require("./rpc.json");
const { v4: uuidv4 } = require("uuid");

/**
 * Creates a new subscription for a user and sends an email with the invoice.
 *
 * @async
 * @param {number} userId - The user ID for which the subscription is being created.
 * @param {string} productKey - The product key associated with the subscription.
 * @returns {Promise<number>} A promise that resolves with the subscription ID or rejects with an error.
 */
async function createSubscription(userId, productKey, data) {
  return new Promise(async (resolve, reject) => {
    // Check if user_id and singleton_id already exist in user_mirrors
    const checkSingletonQuery =
      "SELECT * FROM user_mirrors WHERE user_id = :userId AND singleton_id = :singletonId LIMIT 1";
    try {
      const existingSingleton = await dbQuery(checkSingletonQuery, {
        userId: userId,
        singletonId: data.id,
      });
      if (existingSingleton.length > 0) {
        reject(
          new Error(
            "A subscription already exists for this user with the given singleton_id."
          )
        );
        return;
      }
    } catch (error) {
      console.error("Error checking user_id and singleton_id:", error);
      reject(error);
      return;
    }

    // Set the subscription start and end dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);

    // Load the products configuration
    const productsConfig = await getConfigurationFile("products.config.json");
    const product = productsConfig[productKey];

    if (!product) {
      reject(new Error("Product not found."));
      return;
    }

    // Insert the new subscription into the database
    const queryString = `
      INSERT INTO subscriptions (user_id, product_key, start_date, end_date, status, data)
      VALUES (:userId, :productKey, :startDate, :endDate, 'pending', :data);
    `;

    const queryValues = {
      userId,
      productKey,
      startDate,
      endDate,
      data: JSON.stringify({
        cmd: product.cmd,
        revert_cmd: product.revert_cmd,
        data: {
          userId,
          ...data,
        },
      }),
    };

    try {
      const result = await dbQuery(queryString, queryValues);
      const subscriptionId = result.insertId;
      console.log(`Subscription created with ID: ${subscriptionId}`);

      try {
        // Create the invoice for the new subscription
        await createInvoice(userId, subscriptionId, product);

        console.log(`Invoice email sent to user ID: ${userId}`);
        resolve(subscriptionId);
      } catch (error) {
        console.error("Error creating invoice or sending email:", error);
        reject(error);
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      reject(error);
    }
  });
}

/**
 * Creates a new invoice for a subscription and sends an email with the invoice.
 *
 * @async
 * @param {number} userId - The user ID for which the subscription is being created.
 * @param {number} subscriptionId - The subscription ID for which the invoice is being created.
 * @param {Object} product - The product object containing the product's details.
 * @param {string} product.id - The product ID.
 * @param {string} product.name - The product name.
 * @param {string} product.description - The product description.
 * @param {number} product.cost - The product cost.
 * @returns {Promise<Object>} A promise that resolves with the invoice object or rejects with an error.
 */
async function createInvoice(userId, subscriptionId, product) {
  return new Promise(async (resolve, reject) => {
    // Set the invoice issue date
    const issueDate = new Date();

    // Set the due date to one year in the future
    const dueDate = new Date(issueDate);
    dueDate.setFullYear(issueDate.getFullYear() + 1);

    // Get the cost from the product object
    const amount = product.cost;

    // Send a command to your Chia node to retrieve a new payment address
    const xchPaymentAddress = (
      await sendChiaRPCCommand(rpc.GET_NEW_PAYMENT_ADDRESS)
    )?.result;

    if (!xchPaymentAddress) {
      throw new Error("Error retrieving payment address from Chia node.");
    }

    const invoiceId = uuidv4();

    // Insert the new invoice into the database
    const queryString = `
      INSERT INTO invoices (guid, subscription_id, issue_date, due_date, total_amount_due, xch_payment_address, status)
      VALUES (:guid, :subscriptionId, :issueDate, :dueDate, :amount, :xchPaymentAddress, 'unpaid');
    `;
    const queryValues = {
      guid: invoiceId,
      subscriptionId,
      issueDate,
      dueDate,
      amount,
      xchPaymentAddress,
    };

    try {
      await dbQuery(queryString, queryValues);
      console.log(`Invoice created with ID: ${invoiceId}`);

      // Get the user's email address from the subscription
      const user = await getUserBy("id", userId);

      // Get the service domain from the app.config.json file
      const appConfig = await getConfigurationFile("app.config.json");
      const serviceDomain = appConfig.SERVICE_DOMAIN;

      // Send the invoice email to the user
      const invoiceUrl = `https://app.${serviceDomain}/invoices/${invoiceId}`;
      await sendEmail(
        user.email,
        "Your Invoice",
        `Please pay the invoice at ${invoiceUrl} to activate or renew your subscription.`
      );
      console.log(`Invoice email sent to user: ${user.email}`);

      resolve({
        id: invoiceId,
        subscription_id: subscriptionId,
        issue_date: issueDate,
        due_date: dueDate,
        amount: amount,
        xch_payment_address: xchPaymentAddress,
        status: "unpaid",
      });
    } catch (error) {
      console.error("Error creating invoice or fetching invoice:", error);
      reject(error);
    }
  });
}

async function insertTransactionsAndCalculateSum(
  transactions,
  invoiceId,
  userId
) {
  try {
 let confirmedSum = 0;
 let paymentDetails = [];

 for (const transaction of transactions) {
   if (transaction.confirmed) {
     confirmedSum += transaction.amount / 1000000000000;

     const query = `
        INSERT IGNORE INTO payments (invoice_guid, coin_name, amount, confirmed_at_height, fee)
        VALUES (:invoice_guid, :coinName, :amount, :confirmedAtHeight, :fee)
      `;

     const values = {
       invoice_guid: invoiceId,
       coinName: transaction.name,
       amount: transaction.amount / 1000000000000,
       confirmedAtHeight: transaction.confirmed_at_height,
       fee: transaction.fee_amount,
     };

     await dbQuery(query, values);
     paymentDetails.push(
       `${transaction.name}: ${transaction.amount / 1000000000000} XCH`
     );
   }
 }

 const user = await dbQuery("SELECT * FROM users WHERE id = :userId", {
   userId: userId,
 });

 if (user[0].email && paymentDetails.length > 0) {
   sendEmail(
     user[0].email,
     "Payment Details",
     `The following payments have been detected: <br />${paymentDetails.join(
       "<br />"
     )}<br />Thank you for your business.`
   );
 }

 return confirmedSum;
  } catch(error) {
    console.trace(error.message);
    throw error;
  }
}

async function checkForPayment(invoiceId) {
  return new Promise(async (resolve, reject) => {
    const getInvoiceQueryString = `
      SELECT invoices.*, subscriptions.user_id FROM invoices
      JOIN subscriptions ON invoices.subscription_id = subscriptions.id
      WHERE invoices.guid = :invoiceId;
    `;
    const getInvoiceQueryValues = {
      invoiceId,
    };

    try {
      const result = await dbQuery(
        getInvoiceQueryString,
        getInvoiceQueryValues
      );

      if (result.length === 0) {
        console.error("No invoice found with the provided GUID");
        reject(new Error("No invoice found with the provided GUID"));
        return;
      }

      const invoice = result[0];

      if (invoice.status === "paid") {
        console.log(`Invoice with GUID: ${invoiceId} is already paid.`);
        resolve(invoice);
        return;
      }

      const xchPaymentAddress = invoice.xch_payment_address;

      // Send a command to your Chia node to check for payments to the address
      const addressTransactions = (
        await sendChiaRPCCommand(rpc.GET_TRANSACTIONS, {
          address: xchPaymentAddress,
        })
      )?.result;

      if (!addressTransactions) {
        throw new Error(
          `Error retrieving transactions from Chia node. For ${xchPaymentAddress}`
        );
      }

      const totalXchPaid = await insertTransactionsAndCalculateSum(
        addressTransactions,
        invoiceId,
        invoice.user_id
      );

      if (!totalXchPaid && totalXchPaid !== 0) {
        throw new Error("Error retrieving balance from Chia node.");
      }

      await dbQuery(
        `UPDATE invoices SET amount_paid = :amount_paid WHERE guid = :invoiceId`,
        {
          amount_paid: totalXchPaid,
          invoiceId,
        }
      );

      // Check if the balance is greater than or equal to the invoice amount
      if (totalXchPaid >= invoice.total_amount_due) {
        try {
          // Mark the invoice as paid
          await confirmPayment(invoiceId);
          resolve(invoice);
        } catch (error) {
          reject(error);
        }
      } else {
        console.log(`Invoice with GUID: ${invoiceId} is not paid yet.`);
        resolve(invoice);
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      reject(error);
    }
  });
}

// assumes that the payment
// verification with the Chia blockchain is done outside of this function.
async function confirmPayment(invoiceId) {
  return new Promise(async (resolve, reject) => {
    const updateInvoiceQueryString = `
      UPDATE invoices
      SET status = 'paid'
      WHERE guid = :invoiceId;
    `;
    const updateInvoiceQueryValues = {
      invoiceId,
    };

    try {
      const result = await dbQuery(
        updateInvoiceQueryString,
        updateInvoiceQueryValues
      );

      if (result.affectedRows === 0) {
        console.error("No invoice found with the provided GUID");
        reject(new Error("No invoice found with the provided GUID"));
        return;
      }

      console.log(`Invoice with GUID: ${invoiceId} marked as paid.`);

      const getSubscriptionQueryString = `
        SELECT s.* FROM subscriptions s
        JOIN invoices i ON s.id = i.subscription_id
        WHERE i.guid = :invoiceId;
      `;
      const rows = await dbQuery(getSubscriptionQueryString, { invoiceId });

      if (rows.length === 0) {
        console.error("Error fetching subscription.");
        reject(new Error("Subscription not found."));
      } else {
        const subscription = rows[0];

        // Get current date and calculate the date one year from now
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + 1);

        const updateSubscriptionQueryString = `
          UPDATE subscriptions
          SET status = 'active', start_date = :startDate, end_date = :endDate
          WHERE id = :subscriptionId;
        `;
        await dbQuery(updateSubscriptionQueryString, {
          subscriptionId: subscription.id,
          startDate,
          endDate,
        });

        const subscriptionData = JSON.parse(subscription.data);

        await sendChiaRPCCommand(rpc[subscriptionData.cmd], {
          subscriptionId: subscription.id,
          ...subscriptionData.data,
        });

        console.log(`Subscription ID: ${subscription.id} marked as active.`);
        resolve(subscription.id);
      }
    } catch (error) {
      console.error("Error updating invoice or subscription:", error);
      reject(error);
    }
  });
}

module.exports = {
  createSubscription,
  createInvoice,
  confirmPayment,
  checkForPayment,
};
