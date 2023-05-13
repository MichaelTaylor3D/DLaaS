const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const fs = require("fs");
const Handlebars = require("handlebars");
const path = require("path");

const sesClient = new SESClient({
  region: "us-east-1",
});

const getEmailTemplate = async (templateName, values) => {
  const filePath = path.join(__dirname, "templates", templateName);
  const source = fs.readFileSync(filePath, "utf8");
  const template = Handlebars.compile(source);
  return template(values);
};

const sendEmailWithTemplate = async ({email, subject, template, values}) => {
  const message = await getEmailTemplate(template, values);
  return sendEmail(email, subject, message, message);
}

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
  const command = new SendEmailCommand({
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
          Charset: "UTF-8",
          Data: `<html><body>${htmlMessage || message}</body></html>`,
        },
      },
    },
    Source: "support@datalayer.storage",
  });

  try {
    const response = await sesClient.send(command);
    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendEmailWithTemplate,
};
