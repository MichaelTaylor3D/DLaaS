const { dbQuery, checkForPayment } = require("./common");

// Include your dbQuery, insertTransactionsAndCalculateSum and checkForPayment functions here

exports.handler = async () => {
  try {
    // Query for all unpaid invoices
    const unpaidInvoicesQueryString = `
      SELECT * FROM invoices
      WHERE status = 'unpaid';
    `;

    const unpaidInvoices = await dbQuery(unpaidInvoicesQueryString);

    // Call checkForPayment for each unpaid invoice
    const checkPromises = unpaidInvoices.map((invoice) =>
      checkForPayment(invoice.guid)
    );

    // Wait for all checkForPayment calls to complete
    await Promise.all(checkPromises);

    // Log the success message
    console.log("Checked all unpaid invoices for payments.");
  } catch (error) {
    // Handle errors and log the error message
    console.error("Error checking unpaid invoices for payments:", error);
    throw error;
  }
};
