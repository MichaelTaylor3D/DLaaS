resource "aws_api_gateway_resource" "system_service" {
  rest_api_id = var.api_gateway_id
  parent_id   = var.root_resource_id
  path_part   = "system"
}

resource "aws_api_gateway_resource" "system_v1_api_resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.system_service.id
  path_part   = "v1"
}

# /system/get_files
resource "aws_api_gateway_resource" "get_files_invoices_api_resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.invoice_v1_api_resource.id
  path_part   = "get_files"
}

resource "aws_api_gateway_method" "get_unpaid_invoices_method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.get_unpaid_invoices_api_resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_integration" "get_files_lambda_api_integration" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.get_files_invoices_api_resource.id
  http_method             = aws_api_gateway_method.get_unpaid_invoices_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.list-s3-files-function-handler.invoke_arn
}