locals {
  allowed_origins = "https://app.datalayer.storage"
}

resource "aws_api_gateway_resource" "invoice_service" {
  rest_api_id = var.api_gateway_id
  parent_id   = var.root_resource_id
  path_part   = "invoices"
}

resource "aws_api_gateway_resource" "invoice_v1_api_resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.invoice_service.id
  path_part   = "v1"
}

# /invoices/get_unpaid
resource "aws_api_gateway_resource" "get_unpaid_invoices_api_resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.invoice_v1_api_resource.id
  path_part   = "get_unpaid"
}

# /invoices/{invoiceId}
resource "aws_api_gateway_resource" "invoice_api_resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.invoice_v1_api_resource.id
  path_part   = "{invoiceId}"
}

resource "aws_api_gateway_integration" "get_unpaid_invoices_lambda_api_integration" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.get_unpaid_invoices_api_resource.id
  http_method             = aws_api_gateway_method.get_unpaid_invoices_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_unpaid_invoices_function_handler.invoke_arn
}