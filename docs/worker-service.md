To create a Linux service that runs a the worker script, you can use a systemd unit file. First, create a systemd service configuration file, and then start and enable the service using the `systemctl` command.

Follow these steps:

1. Create a new service file for your Node.js script.

```bash
sudo nano /etc/systemd/system/dlaas.service
```

2. Add the following content to the service file, replacing `/path/to/your-worker-script.js` with the actual path to your Node.js script:

```ini
[Unit]
Description=DLaaS Worker Service
After=network.target

[Service]
ExecStart=/usr/bin/node /path/to/your-worker-script.js
Restart=always
User=nobody
Group=nogroup
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/path/to/your-worker-script

[Install]
WantedBy=multi-user.target
```

3. Save the file and exit the text editor.

4. Reload the systemd daemon to apply the new service configuration:

```bash
sudo systemctl daemon-reload
```

5. Enable and start the service:

```bash
sudo systemctl enable dlaas.service
sudo systemctl start dlaas.service
```

6. Check the status of your service:

```bash
sudo systemctl status dlaas.service
```

Your DLaaS worker script should now be running as a Linux service. The service will automatically restart if the script crashes or if the system is rebooted.