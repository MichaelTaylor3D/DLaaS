/**
 * @fileoverview A script to recursively build npm modules for all modules in a directory.
 */

const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const os = require("os");

const modulesPath = path.resolve(__dirname, "../modules");

/**
 * Recursively builds npm modules for all modules in the given directory.
 * @param {string} directory - The directory path to search for modules.
 */
const buildModulesRecursively = (directory) => {
  // Iterate over all items in the directory
  fs.readdirSync(directory).forEach((module) => {
    const modulePath = path.join(directory, module);

    // Check if the current item has a package.json file
    if (!fs.existsSync(path.join(modulePath, "package.json"))) {
      const lambdasPath = path.join(modulePath, "lambdas");

      // If there's a "lambdas" subdirectory, process it recursively
      if (fs.existsSync(lambdasPath)) {
        buildModulesRecursively(lambdasPath);
      }
      return;
    }

    console.log(`Building module at path: ${modulePath}`);

    // Determine the appropriate npm command based on the platform
    const npmCommand = os.platform().startsWith("win") ? "npm.cmd" : "npm";

    // Execute npm run build for the current module
    cp.spawn(npmCommand, ["run", "build"], {
      env: process.env,
      cwd: modulePath,
      stdio: "inherit",
    });
  });
};

buildModulesRecursively(modulesPath);
