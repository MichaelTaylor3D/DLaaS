# Invoice Resource
resource "aws_api_gateway_resource" "invoice_app_resource" {
  rest_api_id = var.app_gateway_id
  parent_id   = var.app_root_resource_id
  path_part   = "invoices"
}

# /invoices/view
## Resource
resource "aws_api_gateway_resource" "view_invoice_api_resource" {
  rest_api_id = var.app_gateway_id
  parent_id   = aws_api_gateway_resource.invoice_app_resource.id
  path_part   = "{invoiceId}"
}

## Method
resource "aws_api_gateway_method" "view_invoice_method" {
  rest_api_id      = var.app_gateway_id
  resource_id      = aws_api_gateway_resource.view_invoice_api_resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

## Integration
resource "aws_api_gateway_integration" "view_invoice_lambda_api_integration" {
  rest_api_id             = var.app_gateway_id
  resource_id             = aws_api_gateway_resource.view_invoice_api_resource.id
  http_method             = aws_api_gateway_method.view_invoice_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.view_invoice_function_handler.invoke_arn
}
