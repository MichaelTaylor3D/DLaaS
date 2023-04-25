resource "aws_lambda_invocation" "init_schema" {
  function_name = var.create_schema_utility
  input = jsonencode({
    schemaSql = templatefile("${path.module}/schema.sql.tpl", { db_name = var.db_name })
    triggersSql = ""
    proceduresSql = templatefile("${path.module}/procedures.sql.tpl", { db_name = var.db_name })
  })
}