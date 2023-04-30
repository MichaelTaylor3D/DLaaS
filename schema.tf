resource "aws_lambda_invocation" "init-db" {
  function_name = module.service-system-utils.create_schema_utility
  input = jsonencode({
    schemaSql = templatefile("schema.sql.tpl", { db_name = aws_db_instance.default.name })
    triggersSql = ""
    proceduresSql = ""
  })
  
  depends_on = [
    aws_db_instance.default
  ]
}