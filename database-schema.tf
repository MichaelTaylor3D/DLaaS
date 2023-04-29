resource "aws_lambda_invocation" "init_db" {
  function_name = module.service-system-utils.create_schema_utility
  input = jsonencode({
    schemaSql = templatefile("provision-db.sql.tpl", { db_name = aws_db_instance.default.name })
    triggersSql = ""
    proceduresSql = ""
  })
}