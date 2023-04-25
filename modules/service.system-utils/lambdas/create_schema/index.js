"use strict";

const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const { dbQuery } = require("./utils");

exports.handler = async (event) => {
  const { schemaSql = "", triggersSql = "", proceduresSql = "" } = event;

  const sqlStatements = schemaSql
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

  const proceduresStatements = proceduresSql
    .split("END;")
    .filter((statement) => statement.length > 0)
    .map((statement) => `${statement.trim()}\nEND;`);

  const triggersStatements = triggersSql
    .split("END;")
    .filter((statement) => statement.length > 0)
    .map((statement) => `${statement.trim()}\nEND;`);

  // Combine the SQL files into a single string
  const combinedSql = sqlStatements
    .concat(triggersStatements)
    .concat(proceduresStatements);

  // Execute each SQL statement using the dbQuery function
  for (const sql of combinedSql) {
    try {
      await dbQuery(sql);
    } catch (error) {
      console.error(`Failed to execute SQL statement: ${sql}`, error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify("Lambda function executed successfully."),
  };
};
