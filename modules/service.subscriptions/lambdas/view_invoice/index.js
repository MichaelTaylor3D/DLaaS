/**
 * @fileoverview Lambda function to generate an invoice HTML document that
 * also consists of JavaScript and CSS. The URL of the endpoint is in the form:
 * `https://${serviceDomain}/invoices/${invoiceId}`. The lambda function
 * queries the database to get invoice and subscription data and generates
 * a QR code for payment.
 */

const { dbQuery, getConfigurationFile } = require("../utils/lambda-utils");
const QRCode = require("qrcode");

// CSS for the HTML document
const css = `
  body {
    font-family: Arial, sans-serif;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100vh;
    margin: 0;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  #qrcode-container {
    width: 300px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid #ccc;
    margin-bottom: 20px;
  }

  #paid,
  #invalid-invoice {
    font-size: 32px;
    font-weight: bold;
    color: #28a745;
  }

  #invalid-invoice {
    color: #dc3545;
  }

  input[type="text"] {
    width: 100%;
    padding: 12px 20px;
    margin: 8px 0;
    box-sizing: border-box;
  }

  button {
    background-color: #4caf50;
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
  }

  .modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
  }
`;

exports.handler = async (event, context, callback) => {
  try {
    const invoiceId = event.pathParameters.invoiceId;

    // Query the invoice table with the provided invoiceId
    const invoiceQueryString = "SELECT * FROM invoices WHERE guid = :invoiceId";
    const invoice = await dbQuery(invoiceQueryString, { invoiceId });

    if (invoice.length === 0) {
      // If the invoice is not found, return "Invoice not found" page
      const notFoundResponse = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            ${css}
          </style>
        </head>
        <body>
          <h1>Invoice not found</h1>
          <div id="invalid-invoice">INVALID INVOICE</div>
        </body>
        </html>
      `;

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

    // ...
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          ${css}
        </style>
        <script>
          // Copy text to clipboard function
          function copyToClipboard(text) {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
          }
        </script>
      </head>
      <body>
        <h1>Invoice for subscription: ${product.name}</h1>
        <div id="qrcode-container">
          ${
            ["unpaid", "overdue"].includes(invoiceData.status)
              ? `<img src="${qrcodeSvg}" alt="QR Code" />`
              : '<div id="paid">PAID</div>'
          }
        </div>
        ${
          ["unpaid", "overdue"].includes(invoiceData.status)
            ? `<p id="xch-payment-address" onclick="copyToClipboard('${invoiceData.xch_payment_address}')">${invoiceData.xch_payment_address}</p>`
            : ""
        }
        <h1>Invoice for subscription: <span id="product-name"></span></h1>

        <div id="qrcode-container">
          <span id="paid" style="display: none;">PAID</span>
          <span id="invalid-invoice" style="display: none;">INVALID INVOICE</span>
          <canvas id="qrcode" style="display: none;"></canvas>
        </div>

        <p>
          Subscription start date: <span id="start-date"></span><br />
          Subscription end date: <span id="end-date"></span>
        </p>

        <div id="payment-container" style="display: none;">
          <input type="text" id="transaction-hash" placeholder="Transaction hash" />
          <button id="submit-payment">Submit payment</button>
          <button id="check-payment">Check for payment</button>
        </div>

        <div id="modal" class="modal">
          <div class="modal-content">
            <p>Checking for payment... <span id="countdown"></span></p>
          </div>
        </div>
      </body>
    </html>
    `;

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
