// Queues the job when the file is PUT to the s3 bucket
// This is a S3 trigger lambda that is bound to the job folder of this pipeline
// When the file is uploaded to the correct S3 folder, it will trigger this lambda to
// extract the job guid from the bucket key as set in the signedS3PUT
// url thats was provided from the post-job lambda. From there it will
// officially queue the job and set the job status to queued.

"use strict";

const AWS = require("aws-sdk");
const mysql = require("mysql");
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
const { getConfigurationFile } = require("utils");

exports.handler = async (event, context, callback) => {
  const sysConfig = await getConfigurationFile("system.config.json");
  AWS.config.update({ region: sysConfig.region });

  const jobFile = decodeURIComponent(event.Records[0].s3.object.key);
  const jobGuid = jobFile.split("/")[1];
  const jobData = await getJobDataFromDB(jobGuid);
  await queueJob(jobData);
  await setJobAsQueued(jobGuid);
  await wait(5000);
  // Deactivated because reservation system turns on all machines at beginning
  await scaleOutQueue(jobData);
};

const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

const scaleOutQueue = (jobData) => {
  return new Promise(async (resolve) => {
    const autoscaling = new AWS.AutoScaling({ apiVersion: "2011-01-01" });

    const [layer1Config, layer2Config, jobDefinitions] = await Promise.all([
      getConfigurationFile("autoscale.config.json"),
      getConfigurationFile("autoscale-layer-2.config.json"),
      getConfigurationFile("jobs.config.json"),
    ]);

    const jobDefinition = jobDefinitions.find(
      (jobDef) => jobDef.key === jobData.job_type
    );

    if (jobDefinition.stage === "mix_models") {
      autoscaling.executePolicy(
        {
          AutoScalingGroupName: layer2Config.AutoScalingGroupName,
          BreachThreshold: 50.0,
          MetricValue: 59.0,
          PolicyName: layer2Config.ScaleOutPolicyName,
        },
        function (err, data) {
          if (err) {
            console.log(err);
          }
          console.log(data);
          resolve();
        }
      );
    } else {
      /*  autoscaling.executePolicy(
        {
          AutoScalingGroupName: layer1Config.AutoScalingGroupName,
          BreachThreshold: 50.0,
          MetricValue: 59.0,
          PolicyName: layer1Config.ScaleOutPolicyName,
        },
        function (err, data) {
          if (err) {
            console.log(err);
          }
          console.log(data);
        }
      );*/
    }
  });
};

const queueJob = async (jobData) => {
  const [layer1Config, layer2Config, jobDefinitions] = await Promise.all([
    getConfigurationFile("job-queue.config.json"),
    getConfigurationFile("job-queue-layer-2.config.json"),
    getConfigurationFile("jobs.config.json"),
  ]);

  const jobDefinition = jobDefinitions.find(
    (jobDef) => jobDef.key === jobData.job_type
  );

  let endpoint;

  if (layer2Config) {
    switch (jobDefinition.stage) {
      case "mix_models":
        endpoint = layer2Config.endpoint;
        break;
      case "clonegan":
      default:
        endpoint = layer1Config.endpoint;
        break;
    }
  } else {
    endpoint = layer1Config.endpoint;
  }

  let params = {
    MessageAttributes: {
      GUID: {
        DataType: "String",
        StringValue: jobData.guid,
      },
      JobType: {
        DataType: "String",
        StringValue: jobData.job_type,
      },
      UserId: {
        DataType: "String",
        StringValue: jobData.user_id.toString(),
      },
      JobProperties: {
        DataType: "String",
        StringValue: jobData.job_properties,
      },
      Author: {
        DataType: "String",
        StringValue: "Lambda",
      },
    },
    MessageBody: `${jobData.guid}|${jobData.job_type}`,
    MessageDeduplicationId: `${jobData.guid}|${jobData.job_type}`,
    MessageGroupId: "Group1",
    QueueUrl: endpoint,
  };

  return sqs.sendMessage(params).promise();
};

const setJobAsQueued = async (guid) => {
  const dbConfig = await getConfigurationFile("db.config.json");
  const { QUEUED } = await getConfigurationFile("job_status.enum.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(
      /\:(\w+)/g,
      function (txt, key) {
        if (values.hasOwnProperty(key)) {
          return this.escape(values[key]);
        }
        return txt;
      }.bind(this)
    );
  };

  return new Promise((resolve, reject) => {
    const sql = `UPDATE \`jobs\` SET \`job_status\` = :job_status WHERE guid = :guid`;

    const params = {
      guid,
      job_status: QUEUED,
    };

    connection.query(sql, params, (error) => {
      if (error) throw error;
      connection.end();
      resolve();
    });
  });
};

const getJobDataFromDB = async (guid) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(
      /\:(\w+)/g,
      function (txt, key) {
        if (values.hasOwnProperty(key)) {
          return this.escape(values[key]);
        }
        return txt;
      }.bind(this)
    );
  };

  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM `jobs` WHERE `guid` = :guid";

    const params = { guid };

    connection.query(sql, params, (error, results) => {
      if (error) throw error;
      connection.end();
      if (results[0]) {
        resolve(results[0]);
      } else {
        reject("Job Guid does not exist");
      }
    });
  });
};
