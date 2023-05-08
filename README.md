# DLAAS - Datalayer as a Service
## Chia Blockchain Node Monetization Infrastructure

This repository contains the necessary infrastructure for monetizing your Chia Blockchain node and offering its services to customers on a rental basis. The focus of this project is on the Chia data layer, and it is designed as a Software as a Service (SaaS) product, not a decentralized application (dApp). It enables secure interaction with your self-hosted Chia node, providing user-scoped blockchain services. The infrastructure is built on Amazon Web Services (AWS), and an AWS account is required to deploy your instance of the service. The project uses Terraform as an Infrastructure as Code (IaC) tool, allowing for quick and easy provisioning of the service.

A significant portion of this SaaS product relies on an RDS database to manage application state. This approach was chosen to expedite the development process and ensure a timely initial release. In future iterations, the plan is to eliminate the RDS database dependency and transition the service to operate exclusively on its own dedicated data layer tables.

## Main Components

The primary components of this repository include:

1. **Baseline AWS Infrastructure**: This includes the necessary AWS resources and configurations to deploy and run the application.
2. **User Management System**: A comprehensive user management system that enables users to register, log in, and manage their accounts.
3. **Subscription System**: A system that allows users to access the service for a recurring fee, paid in XCH (Chia cryptocurrency).
4. **Worker Script**: A script that runs alongside your Chia node, securely receiving messages from the SaaS product to execute commands against your node.

## Requirements

- An AWS account
- Terraform installed or a terraform.io account
- A self-hosted Chia Blockchain node

## Deployment

To deploy your own instance of the Chia Blockchain Node Monetization Infrastructure, follow the steps provided in the [Deployment Guide](./docs/deployment.md).

## Documentation

For more information on the project and detailed instructions on configuration and usage, refer to the [Documentation](./docs).

## License

This project is licensed under the [MIT License](./LICENSE).

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