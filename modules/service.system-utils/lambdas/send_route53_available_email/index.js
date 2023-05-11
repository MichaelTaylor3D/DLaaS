const { SESClient, ListIdentitiesCommand } = require("@aws-sdk/client-ses");
const { getConfigurationFile, sendEmail } = require("/opt/nodejs/common");
const config = require("/opt/nodejs/common/config.json");

const sesClient = new SESClient({ region: config.AWS_REGION });

exports.handler = async (event) => {
  try {
    const domainConfig = await getConfigurationFile("domain.config.json");
    let identities;

    do {
      // wait for 5 seconds before the next try
      await new Promise((resolve) => setTimeout(resolve, 5000));

      identities = await sesClient.send(
        new ListIdentitiesCommand({ IdentityType: "EmailAddress" })
      );
    } while (!identities.Identities.length);

    const email = identities.Identities[0];

    await sendEmail(
      email,
      "DLaaS Deployment Action Required",
      `Your DLaaS Route 53 zone is now available, <br /> 
        The current deployment is currently on hold until you complete this manual step.
        <br />
        <br />
        Please go to your Domain provider and point its nameservers to the following values:
        <ul>
          <li>${domainConfig.nameservers[0]}</li>
          <li>${domainConfig.nameservers[1]}</li>
          <li>${domainConfig.nameservers[2]}</li>
          <li>${domainConfig.nameservers[3]}</li>
        </ul>
        <br />
        If you do not do this within the nest 20 mins your DLaaS deployment may timeout and you will have to restart it after following this step.
      `
    );
  } catch (error) {
    console.error(error);
  }
};
