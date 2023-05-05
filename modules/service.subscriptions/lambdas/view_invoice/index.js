/**
 * @fileoverview Lambda function to generate an invoice HTML document that
 * also consists of JavaScript and CSS. The URL of the endpoint is in the form:
 * `https://${serviceDomain}/invoices/${invoiceId}`. The lambda function
 * queries the database to get invoice and subscription data and generates
 * a QR code for payment.
 */

const { dbQuery, getConfigurationFile } = require("./common");
const QRCode = require("qrcode");

// NOTE: Not a big fan of this file and I would like to rewrite it using React
// However since its working as needed, ill refactor it later.

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

  .toast {
    visibility: hidden;
    min-width: 250px;
    margin-left: -125px;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 2px;
    padding: 16px;
    position: fixed;
    z-index: 1;
    left: 50%;
    bottom: 30px;
    font-size: 17px;
    opacity: 0;
    transition: opacity 0.5s, visibility 0.5s;
  }

  .toast.show {
    visibility: visible;
    opacity: 1;
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

  #container {
    max-width: 60;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  #payment-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
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
          function submitTransactionHash(event) {
            const transactionHash = document.getElementById('transaction-hash').value;
            fetch('/confirm-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transactionHash }),
            });
            showCountdownModal();
          }

        function checkPayment() {
          const currentUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
          fetch(currentUrl + '/check-for-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invoiceId: '${invoiceId}' }),
          });
          showCountdownModal();
        }

          function showCountdownModal() {
            const countdownModal = document.createElement('div');
            countdownModal.setAttribute('style', 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center;');
            countdownModal.innerHTML = '<div style="background-color: white; padding: 2rem; text-align: center;"><h2>Checking for payment</h2><p id="countdown">10</p></div>';
            document.body.appendChild(countdownModal);

            let secondsLeft = 10;
            const countdownInterval = setInterval(() => {
              secondsLeft = secondsLeft - 1;
              document.getElementById('countdown').innerText = secondsLeft;
              if (secondsLeft === 0) {
                clearInterval(countdownInterval);
                location.reload();
              }
            }, 1000);
          }

          function showToast(message) {
            const toast = document.getElementById("toast");
            toast.innerText = message;
            toast.classList.add("show");
            setTimeout(() => {
              toast.classList.remove("show");
            }, 3000);
          }

          function copyToClipboard(text) {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            showToast("XCH payment address copied to clipboard!");
          }
        </script>
      </head>
      <body>
      <div>
          Invoice #${invoiceData.guid}
      </div>
      <div id="container">
        <h1>Invoice for subscription: ${product.name}</h1>
        <h3>Please send exactly${
          invoiceData.total_amount_due - invoiceData.amount_paid
        } XCH to activate this subscription.</h3>
        <h5>All sales are final.</h5>
        status: ${invoiceData.status}<br /><br />
        <div id="qrcode-container">
          ${
            ["unpaid", "overdue"].includes(invoiceData.status)
              ? `<img src="${qrcodeSvg}" alt="QR Code" />`
              : '<div id="paid">PAID</div>'
          }
        </div>
        ${
          ["unpaid", "overdue"].includes(invoiceData.status)
            ? `<p>
                <span onclick="copyToClipboard('${invoiceData.xch_payment_address}')" style="cursor: pointer;">
                  <span id="xch-payment-address" onclick="copyToClipboard('${invoiceData.xch_payment_address}')">${invoiceData.xch_payment_address}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
                    <path d="M6 1a2 2 0 0 0-2 2v1H1v10h14V4h-3V3a2 2 0 0 0-2-2h-4zm0 3h4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1H3V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1z"/>
                  </svg>
                </span>
              </p>
              `
            : ""
        }
        <p>
          Subscription start date: <span id="start-date">${new Date(
            subscription[0].start_date
          ).toLocaleDateString()}</span><br />
          Subscription end date: <span id="end-date">${new Date(
            subscription[0].end_date
          ).toLocaleDateString()}</span>
        </p>

        <p><b><i>When your subscription is getting close to renewal you will receive a new invoice in your email to renew this subscription for the next year. </i></b></p>
        <br />
        <br />
        <div id="payment-container">
          <div>Payment can take up to 24 hours to be detected. To detect it sooner, you can try "check for payment" button.</div>
          <button id="check-payment" onclick="checkPayment()">Check for payment</button>
        </div>

        <div id="toast" class="toast"></div>
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
