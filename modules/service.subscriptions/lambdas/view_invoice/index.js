const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { dbQuery, getConfigurationFile } = require("./common");
const QRCode = require("qrcode");

// Import your React components here
const InvoicePage = require("./InvoicePage");

exports.handler = async (event, context, callback) => {
  try {
    const invoiceId = event.pathParameters.invoiceId;

    // Query the invoice table with the provided invoiceId
    const invoiceQueryString = "SELECT * FROM invoices WHERE guid = :invoiceId";
    const invoice = await dbQuery(invoiceQueryString, { invoiceId });

    if (invoice.length === 0) {
      // If the invoice is not found, return "Invoice not found" page
      const notFoundResponse = ReactDOMServer.renderToString(
        <InvoicePage.NotFound />
      );

      return {
        statusCode: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: notFoundResponse,
      };
    }

    // Get invoice, subscription, and product data
    const invoiceData = invoice[0];
    const subscriptionQueryString =
      "SELECT * FROM subscriptions WHERE id = :subscriptionId";
    const subscription = await dbQuery(subscriptionQueryString, {
      subscriptionId: invoiceData.subscription_id,
    });

    const productKey = subscription[0].product_key;
    const productsConfig = await getConfigurationFile("products.config.json");
    const product = productsConfig[productKey];

    // Generate QR code if the invoice is unpaid or overdue
    let qrcodeSvg = "";
    if (["unpaid", "overdue"].includes(invoiceData.status)) {
      qrcodeSvg = await QRCode.toDataURL(invoiceData.xch_payment_address, {
        width: 300,
        type: "image/png",
      });
    }

    const html = ReactDOMServer.renderToString(
      <InvoicePage
        invoiceId={invoiceId}
        invoiceData={invoiceData}
        product={product}
        subscription={subscription[0]}
        qrcodeSvg={qrcodeSvg}
      />
    );

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: html,
    });
  } catch (error) {
    callback(null, {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ message: error.message }),
    });
  }
};
