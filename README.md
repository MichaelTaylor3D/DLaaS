# DLAAS - Datalayer as a Service
## Chia Blockchain Node Monetization Infrastructure

This repository contains the necessary infrastructure for monetizing your Chia Blockchain node and offering its services to customers on a rental basis. The focus of this project is on the Chia data layer, and it is designed as a Software as a Service (SaaS) product, not a decentralized application (dApp). It enables secure interaction with your self-hosted Chia node, providing user-scoped blockchain services. The infrastructure is built on Amazon Web Services (AWS), and an AWS account is required to deploy your instance of the service. The project uses Terraform as an Infrastructure as Code (IaC) tool, allowing for quick and easy provisioning of the service.

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