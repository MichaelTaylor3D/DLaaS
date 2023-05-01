const SES = require("aws-sdk/clients/ses");

const ses = new SES({
  apiVersion: "2010-12-01",
  region: "us-east-1",
});

/**
 * Sends an email using the AWS SES service.
 * @async
 * @function
 * @param {string} email - The recipient's email address.
 * @param {string} title - The email subject.
 * @param {string} message - The plain text email message.
 * @param {string} [htmlMessage] - The HTML email message (optional).
 * @returns {Promise<Object>} - A promise that resolves with the AWS SES sendEmail response.
 * @throws {Error} If the email sending process fails.
 */
const sendEmail = async (email, title, message, htmlMessage) => {
  return ses
    .sendEmail({
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: {
          Charset: "UTF-8",
          Data: title,
        },
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: message,
          },
          Html: {
            Data: `<html><body>${htmlMessage || message}</body></html>`,
          },
        },
      },
      Source: "support@datalayer.storage",
    })
    .promise();
};

module.exports = {
  sendEmail,
};
