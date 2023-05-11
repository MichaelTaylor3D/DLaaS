provider "aws" {
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  region     = var.aws_region
}

output "create_schema_utility" { value = aws_lambda_function.create-schema-function-handler.function_name }
output "send_route53_email_function_handler_name" { value = aws_lambda_function.send_route53_email_function_handler.function_name }