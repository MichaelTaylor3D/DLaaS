const {
  SESClient,
  ListIdentitiesCommand,
  GetIdentityVerificationAttributesCommand,
} = require("@aws-sdk/client-ses");

const {
  getConfigurationFile,
  sendEmailWithTemplate,
} = require("/opt/nodejs/common");

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

    return sendEmailWithTemplate({
      email: verifiedIdentity,
      subject: "DLaaS Deployment Action Required",
      template: "depoyment-action-nameservers.handlebars",
      values: {
        nameservers: [...domainConfig.nameservers],
      },
    });
  } catch (error) {
    console.error(error);
  }
};
