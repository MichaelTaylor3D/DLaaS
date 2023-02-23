"use strict";


var request = require("request");
exports.handler = async (event, context, callback) => {



request.post(
  "https://jkmqb7ezf0.execute-api.us-east-1.amazonaws.com/production",
  { json: { key: "value" } },
  function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
  }
);
    callback(null, {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        message: `User email change request has been cancelled. Contact the Admin if you suspect anything suspicious.`,
      }),
    });
  
};
