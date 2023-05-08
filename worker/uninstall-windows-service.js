const Service = require("node-windows").Service;
const path = require("path");

// Define the Node.js script you set up as a service
const scriptPath = path.join(__dirname, "cluster.js");

// Create a new service object
const svc = new Service({
  name: "DLaaS Worker Service",
  script: scriptPath,
});

// Listen for the "uninstall" event, which indicates the service is uninstalled
svc.on("uninstall", () => {
  console.log("Service uninstalled successfully");
});

// Uninstall the service
svc.uninstall();
