const mysql = require("mysql2/promise");
const AWS = require("aws-sdk");
const ses = new AWS.SES({ region: "us-east-1" });

exports.handler = async (event) => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const gracePeriodDays = 15;
  const currentDate = new Date();
  const gracePeriodEndDate = new Date(
    currentDate - gracePeriodDays * 24 * 60 * 60 * 1000
  );

  const queryString = `
    SELECT s.*, u.email FROM subscriptions s
    JOIN users u ON s.user_id = u.id
    WHERE s.status = 'grace_period' AND s.end_date <= ?
  `;

  const [rows] = await connection.execute(queryString, [gracePeriodEndDate]);

  console.log(
    `Found ${rows.length} terminated subscriptions to send emails to.`
  );

  const emailPromises = rows.map(async (subscription) => {
    const emailSubject = "Subscription Termination Notification";
    const emailBody = `Hello ${subscription.email},\n\nYour subscription has been terminated and cannot be renewed. Please create a new subscription if you wish to continue using our service.\n\nThank you for your understanding.`;

    const params = {
      Destination: {
        ToAddresses: [subscription.email],
      },
      Message: {
        Body: {
          Text: { Data: emailBody },
        },
        Subject: { Data: emailSubject },
      },
      Source: process.env.FROM_EMAIL,
    };

    try {
      await ses.sendEmail(params).promise();
      console.log(`Termination email sent to ${subscription.email}.`);
    } catch (error) {
      console.error(
        `Error sending termination email to ${subscription.email}:`,
        error
      );
    }
  });

  await Promise.all(emailPromises);

  await connection.end();

  console.log("Done.");

  return {
    statusCode: 200,
    body: JSON.stringify("Terminated subscription emails sent successfully."),
  };
};
