# DLaaS - Datalayer as a Service
## Monetize Your Chia Blockchain Node

Welcome to the DLaaS repository, your one-stop solution for converting your Chia Blockchain node into a lucrative venture. This project focuses on the Chia data layer, offering its services to clients on a rental basis. The system operates as a Software as a Service (SaaS) product, facilitating secure interactions with your self-hosted Chia node, and delivering user-scoped blockchain services.

Built on Amazon Web Services (AWS), the infrastructure requires an AWS account for deployment. The repository utilizes Terraform as an Infrastructure as Code (IaC) tool for seamless service provisioning. Keep in mind that at the outset, running DLaaS without customers costs approximately $30 per month. As your customer base grows, expenses will increase, necessitating appropriately priced products to cover costs.

The SaaS product heavily depends on an RDS database to manage application state, an approach chosen to accelerate development and ensure a swift initial release. Future plans include phasing out the RDS dependency and shifting the service to operate solely on its dedicated data layer tables.

# Use at Your Own Risk Warning

Please be aware that this software is provided "as is", without warranty of any kind, expressed or implied. While we make every effort to provide you with quality code and comprehensive documentation, we cannot guarantee that this software is free from bugs or secure from hacking or other cybersecurity threats.

You use this software at your own risk. The developers, contributors, and the associated entities are not responsible for any damage, data loss, or negative effects that may occur as a result of using this software. Always back up your data and test the software extensively before integrating it into your systems or using it for any critical applications or functions.

It is your responsibility to comply with all applicable laws and regulations when using this software. This includes, but is not limited to, data protection and privacy laws, intellectual property laws, and any rules or requirements specific to your industry or jurisdiction.

By choosing to use this software, you acknowledge that you understand these risks and accept full responsibility for any outcomes that may arise from its use. If you are unsure about any aspect of these warnings or if you have any questions, we recommend seeking advice from a qualified professional before proceeding.

## Quick Start Guide

Follow these steps for swift setup and usage of the DLaaS system:

1. **Fork the Repository**: Fork the DLaaS repository to your GitHub account.

2. **Create Terraform Cloud Account**: Sign up for a free account on [terraform.io](https://www.terraform.io/cloud/signup/account) and create a new workspace.

3. **Adjust Terraform Settings**: In the `main.tf` file of your forked repository, modify the "remote" settings to match your Terraform workspace.

4. **Modify Project Settings**: Update properties in `common/config.json` and `modules/service.subscriptions/projects.json` to align with your project. Retaining default properties may result in deployment errors due to AWS resource conflicts.

5. **Define Terraform Variables**: Define the following variables in your Terraform workspace: `aws_access_key`, `aws_secret_key`, and `owner_email`.

6. **Verify AWS Identity**: Upon the first deployment, AWS will email a verification request. Complete this promptly to prevent deployment delays.

7. **Set Up Nameservers**: Post-verification, you'll receive instructions for setting up your nameservers. Deployment cannot proceed until nameservers are configured with your DNS provider. If propagation causes a timeout, restart the deployment to continue from where it left off.

8. **Clone Repository**: Clone the forked repository onto a machine running a Chia Wallet (full node not required). Ensure datalayer settings are enabled on this machine.

9. **Set Up Worker**: In the worker folder create a .env file using .env.copy as a blueprint

10. **Find API Info**: A Swagger file is still in the works, while your waiting you can go to the API Gateway Console settings in AWS to view all the available API's.

Congratulations, you're all set to use the DLaaS system!

## Components

The repository primarily comprises:

1. **Baseline AWS Infrastructure**: Necessary AWS resources and configurations for application deployment and running.

2. **User Management System**: A robust system for user registration, login, and account management.

3. **Subscription System**: Allows users to access the service for a recurring fee, payable in XCH (Chia cryptocurrency).

4. **Worker Script**: A script running alongside your Chia node, securely receiving and executing commands from the SaaS product.

## Requirements

- AWS account
- Terraform installation or a terraform.io account
- Self-hosted Chia Blockchain node

## Deployment

Follow the [Deployment Guide](./docs/deployment.md) for deploying your Chia Blockchain Node Monetization Infrastructure.

## Documentation

Refer to the [Documentation](./docs) for comprehensive project information and usage instructions.

## License

This project is under the [MIT License](./LICENSE).

# Support My Project

I hope this message finds you well. As the developer behind **DLaaS**, I am dedicated to continuously improving and expanding the project. Your generous support plays a crucial role in helping me achieve these goals and make a positive impact on the community.

To show your support, please consider making a donation in Chia (XCH) to the following address:

```
xch1ecyxgv2ft2rj3q26ltmcfpy5gfg0dh2rdqlr0rhf8stfxph3tjnqpxtvpd
```

Every contribution, big or small, helps me maintain and enhance the project, ensuring its sustainability and success. I sincerely appreciate your support and am grateful for any donations made.

Thank you for believing in **DLaaS** and supporting my mission.

## Author Availability for Consulting

The author of this repository is available for hire to help you set up or develop your business product on DLaaS (Datalayer as a Service). With extensive experience and expertise in the field, they can provide valuable insights and guidance to ensure that your project is a success.

Whether you need assistance in setting up the infrastructure, optimizing your data storage and management, or integrating the service into your existing systems, the author is well-equipped to help you make the most out of DLaaS.

To discuss your project requirements and consulting rates, please [contact the author](mailto:your-email@example.com) directly. Let's work together to bring your business to the next level with advanced datalayer solutions.