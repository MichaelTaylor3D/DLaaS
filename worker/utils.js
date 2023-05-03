const _ = require("lodash");
const os = require("os");
const path = require("path");

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
  const data = JSON.parse(json);
  for (const key in data) {
    if (string === key) {
      return true;
    }
  }
  return false;
}

module.exports = {
  getChiaRoot,
  matchKey,
};
