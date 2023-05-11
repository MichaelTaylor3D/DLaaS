const superagent = require("superagent");
const path = require("path");
const fs = require("fs");
const https = require("https");
const {
  getConfigurationFile,
  dbQuery,
  sendEmail
} = require("../../../common");

const { getChiaRoot } = require("../../utils");

const delete_mirror = async (payload) => {
  try {
    // call get_mirrors on the singletonid, find the mirror with the url to the CDN
    // capture the coin_id and call delete_mirror on the coin_id
    // then delete the mirror from the user_mirrors table
    // also send an email that the mirror has been deleted
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
};

module.exports = {
  createMirror,
};
