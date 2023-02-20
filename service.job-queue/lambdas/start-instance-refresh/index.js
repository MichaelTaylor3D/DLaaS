"use strict";

const AWS = require("aws-sdk");
const { getConfigurationFile } = require("utils");

exports.handler = async (event, context, callback) => {
  const startInstanceRefresh = new Promise(async (resolve) => {
    const autoscaling = new AWS.AutoScaling({ apiVersion: "2011-01-01" });
    const autoscaleConfig = await getConfigurationFile("autoscale.config.json");

    var params = {
      AutoScalingGroupName: autoscaleConfig.AutoScalingGroupName,
      Preferences: {
        InstanceWarmup: 400,
        MinHealthyPercentage: 90,
      },
    };

    autoscaling.startInstanceRefresh(params, function (err, data) {
      if (err) {
        resolve(err);
        return;
      }
      resolve(data);
    });

    var params2 = {
      AutoScalingGroupName: autoscaleConfig.AutoScalingGroupName,
      Preferences: {
        InstanceWarmup: 400,
        MinHealthyPercentage: 90,
      },
    };

    autoscaling.startInstanceRefresh(params, function (err, data) {
      if (err) {
        resolve(err);
        return;
      }
      resolve(data);
    });
  });

  const data = await startInstanceRefresh;

  callback(null, {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(data),
  });
};
