# notify the admin via email that route 53 is created and nameservers must be set to continue deployment
resource "aws_lambda_invocation" "notify_route53_nameservers_available" {
  function_name = aws_lambda_function.send_route53_email_function_handler.function_name
  input = ""

  depends_on = [
    var.domain_zone
  ]
}

output "create_schema_utility" { value = aws_lambda_function.create-schema-function-handler.function_name }
output "send_route53_email_function_handler_name" { value = aws_lambda_function.send_route53_email_function_handler.function_name }