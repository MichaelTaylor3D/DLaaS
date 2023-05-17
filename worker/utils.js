const _ = require("lodash");
const os = require("os");
const path = require("path");
const fs = require("fs");

const getChiaRoot = _.memoize(() => {
  let chiaRoot;

  if (process.env.CHIA_ROOT) {
    chiaRoot = path.resolve(process.env.CHIA_ROOT);
  } else {
    const homeDir = os.homedir();
    chiaRoot = path.resolve(`${homeDir}/.chia/mainnet`);
  }

  return chiaRoot;
});

const matchKey = (json, string) => {
  for (const key in json) {
    if (string === key) {
      return true;
    }
  }
  return false;
};

const getFilesBySubstring = (substring) => {
  const chiaRoot = getChiaRoot();
  const directory = path.join(
    chiaRoot,
    "data_layer",
    "db",
    "server_files_location_mainnet"
  );
  const files = fs.readdirSync(directory);
  const matchedFiles = files.filter((file) => file.includes(substring));
  return matchedFiles;
};

module.exports = {
  getChiaRoot,
  getFilesBySubstring,
  matchKey,
};
