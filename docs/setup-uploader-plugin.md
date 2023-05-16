## Serving Datalayer Files through CDN

In order to utilize the CDN that is set up within this repository for serving datalayer files, you need to make a configuration adjustment in the Chia Blockchain configuration file. Specifically, you must add the URL `https://plugin.<your-domain>` to the `config.yaml` file.

The `config.yaml` file for Chia Blockchain is typically located in the following directory: `~/.chia/mainnet/config/`. 

Open the `config.yaml` file in your preferred text editor and locate the section for plugin settings. Add the URL `https://plugin.<your-domain>` to the list of approved plugin sources in the uploaders array. 

```
data_layer:
  uploaders:
  - https://plugin.<your-domain>
```

This allows the Chia Blockchain to access and use the plugins served from your CDN.

For more detailed information about configuring Chia to work with the datalayer, including screenshots and additional context, please refer to the Chia documentation on [Datalayer Permissions and Configuration](https://docs.chia.net/guides/datalayer-permissions/#chia-configuration). This guide provides a comprehensive overview of the necessary steps and requirements for setting up DLaaS within Chia.