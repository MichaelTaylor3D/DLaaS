/**
 * @fileoverview This module exports a Lambda function that processes the input
 * SQL files for schema, triggers, and procedures, and executes them on the
 * database using the dbQuery function from the 'utils' module.
 */

"use strict";

// Import required modules
const fs = require("fs");
const util = require("util");
const { dbQuery } = require("./utils");

/**
 * Lambda function that processes and executes SQL files for schema, triggers, and procedures.
 *
 * @param {Object} event - The event object containing the SQL files.
 * @param {string} event.schemaSql - SQL file containing schema definitions.
 * @param {string} event.triggersSql - SQL file containing trigger definitions.
 * @param {string} event.proceduresSql - SQL file containing stored procedure definitions.
 * @returns {Object} - The response object containing the status code and body message.
 */
exports.handler = async (event) => {
  const { schemaSql = "", triggersSql = "", proceduresSql = "" } = event;

  // Process schema SQL statements
  const sqlStatements = schemaSql
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

  // Process stored procedure SQL statements
  const proceduresStatements = proceduresSql
    .split("END;")
    .filter((statement) => statement.length > 0)
    .map((statement) => `${statement.trim()}\nEND;`);

  // Process trigger SQL statements
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

  // Return the success response
  return {
    statusCode: 200,
    body: JSON.stringify("Lambda function executed successfully."),
  };
};
