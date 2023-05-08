const Service = require("node-windows").Service;
const path = require("path");

// Define the Node.js script you want to run as a service
const scriptPath = path.join(__dirname, "cluster.js");

// Create a new service object
const svc = new Service({
  name: "DLaaS Worker Service",
  description: "Runs the DLaaS worker service.",
  script: scriptPath,
});

// Listen for the "install" event, which indicates the service is installed
svc.on("install", () => {
  console.log("Service installed successfully");
  svc.start();
});

// Listen for the "alreadyinstalled" event, which indicates the service is already installed
svc.on("alreadyinstalled", () => {
  console.log("Service is already installed");
});

// Listen for the "error" event, which indicates there was an error installing the service
svc.on("error", (err) => {
  console.error("Error:", err.message);
});

// Install the service
svc.install();
