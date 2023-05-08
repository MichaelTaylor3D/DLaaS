/**
 * @fileoverview A script to recursively install npm dependencies for all modules in a directory.
 */

const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const os = require("os");

const modulesPath = path.resolve(__dirname, "../modules");

/**
 * Recursively installs npm dependencies for all modules in the given directory.
 * @param {string} directory - The directory path to search for modules.
 */
const installDependenciesRecursively = (directory) => {
  // Iterate over all items in the directory
  fs.readdirSync(directory).forEach((module) => {
    const modulePath = path.join(directory, module);

    // Check if the current item has a package.json file
    if (!fs.existsSync(path.join(modulePath, "package.json"))) {
      const lambdasPath = path.join(modulePath, "lambdas");

      // If there's a "lambdas" subdirectory, process it recursively
      if (fs.existsSync(lambdasPath)) {
        installDependenciesRecursively(lambdasPath);
      }
      return;
    }

    console.log(`Installing module at path: ${modulePath}`);

    // Determine the appropriate npm command based on the platform
    const npmCommand = os.platform().startsWith("win") ? "npm.cmd" : "npm";

    // Execute npm install for the current module
    cp.spawn(npmCommand, ["install"], {
      env: process.env,
      cwd: modulePath,
      stdio: "inherit",
    });
  });
};

installDependenciesRecursively(modulesPath);
