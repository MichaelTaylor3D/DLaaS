provider "aws" {
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  region     = var.aws_region
}

output "create_schema_utility" { value = aws_lambda_function.create-schema-function-handler.function_name }
