/**
 * @fileoverview This Terraform configuration file manages the invocation of an AWS Lambda
 * function for initializing a database schema. The Lambda function is provided with input
 * parameters containing the schema SQL, triggers SQL (empty in this case), and procedures SQL.
 * The SQL files are generated using template files and the database name from the input
 * variables.
 */

resource "aws_lambda_invocation" "init-schema" {
  function_name = var.create_schema_utility
  input = jsonencode({
    schemaSql = templatefile("${path.module}/schema.sql.tpl", { db_name = var.db_name })
    triggersSql = ""
    proceduresSql = templatefile("${path.module}/procedures.sql.tpl", { db_name = var.db_name })
  })
}