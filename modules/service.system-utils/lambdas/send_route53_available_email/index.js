const {
  SESClient,
  ListIdentitiesCommand,
  GetIdentityVerificationAttributesCommand,
} = require("@aws-sdk/client-ses");
const { getConfigurationFile, sendEmail } = require("/opt/nodejs/common");
const config = require("/opt/nodejs/common/config.json");

const sesClient = new SESClient({ region: config.AWS_REGION });

exports.handler = async (event) => {
  try {
    const domainConfig = await getConfigurationFile("domain.config.json");
    let identities;
    let verifiedIdentity;

    do {
      // wait for 5 seconds before the next try
      await new Promise((resolve) => setTimeout(resolve, 5000));

      identities = await sesClient.send(
        new ListIdentitiesCommand({ IdentityType: "EmailAddress" })
      );

      for (let identity of identities.Identities) {
        const attributes = await sesClient.send(
          new GetIdentityVerificationAttributesCommand({
            Identities: [identity],
          })
        );

        if (
          attributes.VerificationAttributes[identity].VerificationStatus ===
          "Success"
        ) {
          verifiedIdentity = identity;
          break;
        }
      }
    } while (!verifiedIdentity);

    return sendEmail(
      verifiedIdentity,
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
        If the deployment times out before this change is submitted and propagated, simply restart the deployment and it should pick up where it left off.
      `
    );
  } catch (error) {
    console.error(error);
  }
};
