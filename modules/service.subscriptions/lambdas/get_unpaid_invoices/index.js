const { assertBearerTokenOrBasicAuth, dbQuery } = require("/opt/nodejs/common");

async function getAllUnpaidInvoices(userId) {
  const queryString = `
    SELECT
      i.*,
      s.user_id,
      s.product_key,
      s.start_date,
      s.end_date,
      s.status as subscription_status,
      s.data
    FROM invoices i
    JOIN subscriptions s ON i.subscription_id = s.id
    WHERE s.user_id = :userId AND i.status = 'unpaid'
    ORDER BY i.issue_date DESC;
  `;

  const queryValues = { userId };
  const result = await dbQuery(queryString, queryValues);

  return result;
}

exports.handler = async (event, context, callback) => {
  try {
    const decodedToken = await assertBearerTokenOrBasicAuth(
      event.headers.Authorization
    );
    const userId = decodedToken.user_id;

    const invoices = await getAllUnpaidInvoices(userId);

    if (!invoices || invoices.length === 0) {
      callback(null, {
        statusCode: 404,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ message: "No unpaid invoices found." }),
      });
      return;
    }

    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(invoices),
    });
  } catch (error) {
    console.error("Error retrieving unpaid invoices:", error);
    callback(null, {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: "An error occurred while processing your request.",
      }),
    });
  }
};
