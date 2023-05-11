# DLaaS Subdomains

DLaaS provides several subdomains, each with its specific use-case. These subdomains are created as part of the deployment process and are important for the functionality of the DLaaS system. They are as follows:

- **cdn.datalayer.storage**: This subdomain is used to serve datalayer files on CloudFront Edge servers. These files can then be consumed by datalayer subscribers.

- **app.datalayer.storage**: This subdomain is used for any pages that are viewed in the browser, such as invoice pages.

- **api.datalayer.storage**: This subdomain is the entry point for the main DLaaS API.

- **plugin.datalayer.storage**: This subdomain is used by the datalayer uploader plugin. The plugin pushes datalayer files to the CDN. Note that this subdomain is not meant to be consumed by anything other than the datalayer uploader plugin.

## Subdomain Setup

The setup of these subdomains is handled by a Terraform configuration during the deployment process. The process is as follows:

1. When you deploy the Terraform configuration, it will create a Route 53 zone that includes a list of nameservers.

2. Once the zone is created, the deployment will go into a waiting mode.

3. At this point, it is up to the admin to log into the AWS console, navigate to the DLaaS zone, and take note of the nameservers.

4. Then, the admin must go to their domain provider (such as NameCheap.com or GoDaddy.com) and set their domain to use the Route 53 nameservers.

5. After the nameservers are updated, it will take a few minutes for the change to propagate. Once propagated, the Terraform deployment will resume.

> **Important:** This step is crucial because if the admin fails to update the nameservers during deployment, the deployment will eventually time out. The nameserver change is required to continue the deployment, specifically to generate the SSL certificates needed to create the subdomains listed above.

By following these steps, your DLaaS subdomains should be correctly set up and ready to use.