resource "aws_api_gateway_resource" "product_api_resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = var.root_resource_id
  path_part   = "product"
}

resource "aws_api_gateway_resource" "product_v1_api_resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.product_api_resource.id
  path_part   = "v1"
}

# /product/create_subscription
resource "aws_api_gateway_resource" "create_subscription_api_resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.product_v1_api_resource.id
  path_part   = "create_subscription"
}

resource "aws_api_gateway_method" "get_unpaid_invoices_method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.get_unpaid_invoices_api_resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_method" "create_subscription_method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.create_subscription_api_resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_integration" "create_subscription_lambda_api_integration" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.create_subscription_api_resource.id
  http_method             = aws_api_gateway_method.create_subscription_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.create_subscription_function_handler.invoke_arn
}