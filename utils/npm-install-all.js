var fs = require('fs');
var resolve = require('path').resolve;
var join = require('path').join;
var cp = require('child_process');
var os = require('os');

// get library path
var lib = resolve(__dirname, '../modules');

const installRecursively = (dir) => {
  fs.readdirSync(dir).forEach(function (mod) {
    var modPath = join(dir, mod);

    console.log('Checking path for npm install', modPath);

    // ensure path has package.json
    if (!fs.existsSync(join(modPath, 'package.json'))) {
      const lambdaPath = join(modPath, 'lambdas');
      if (fs.existsSync(lambdaPath)) {
        installRecursively(lambdaPath);
      }
      return;
    }

    console.log(`Building module at path: ${modPath}`);

    // npm binary based on OS
    var npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

    // install folder
    cp.spawn(npmCmd, ['i'], {
      env: process.env,
      cwd: modPath,
      stdio: 'inherit',
    });
  });
};

installRecursively(lib);
