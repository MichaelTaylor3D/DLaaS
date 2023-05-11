# DLaaS Email System

DLaaS utilizes Amazon's Simple Email Service (SES) to send transactional emails. However, it's important to remember that when initially deployed, the email service starts in sandbox mode. This mode is designed for developers to test and evaluate the service, but it comes with some restrictions.

For testing purposes, you must go into the AWS Console and add your own email as a verified identity. This allows you to send emails to and receive emails from this specific address only.

In order to move SES out of the sandbox mode and into production, you need to follow the necessary steps to ensure your emails can reach all users. If you fail to do so before moving DLaaS to production, the system will not function properly because users will not be able to receive emails.

## Steps to Move SES Out of Sandbox Mode

Follow these steps to request Amazon SES to move your account from sandbox mode to production mode:

1. Sign in to the AWS Management Console and open the Amazon SES console.

2. In the left navigation pane, click on "Sending statistics".

3. Click on "Request a Sending Limit Increase" to open the corresponding page in the AWS Support Center.

4. For **Limit type**, choose "SES Sending Limits".

5. For **Mail Type**, choose the type of email that you plan to send.

6. For **Website URL**, enter the URL of your website. Providing this information helps Amazon SES to better understand the type of content that you plan to send.

7. For **My email-sending complies with the AWS Service Terms and AUP**, choose "Yes".

8. For **I only send to recipients who have specifically requested my mail**, choose "Yes".

9. For **I have a process to handle bounces and complaints**, choose "Yes".

10. Under **Region**, select the AWS Region that you want to increase your sending limit in.

11. For **Limit**, choose "Desired Daily Sending Quota".

12. For **New limit value**, enter the number of emails that you want to send per day.

13. In the **Use Case Description** box, provide a description of your use case.

14. Choose "Submit".

Once you have completed these steps, AWS will review your request to increase the sending limit. Once your request is approved, you'll be able to send emails to any recipient from your verified domains and email addresses.

Keep in mind that while you're in sandbox mode, you also need to verify every email address that you send emails to. This step is not necessary once your account is in production mode.