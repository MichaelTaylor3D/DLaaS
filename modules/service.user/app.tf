# User App Resource
resource "aws_api_gateway_resource" "user_app_resource" {
  rest_api_id = var.app_gateway_id
  parent_id   = var.app_root_resource_id
  path_part   = "user"
}

# /user/confirm_change_email
## Resource
resource "aws_api_gateway_resource" "confirm-change-email-api-resource" {
  rest_api_id = var.app_gateway_id
  parent_id   = aws_api_gateway_resource.user_app_resource.id
  path_part   = "confirm_change_email"
}

## Method
resource "aws_api_gateway_method" "confirm-change-email-method" {
  rest_api_id      = var.app_gateway_id
  resource_id      = aws_api_gateway_resource.confirm-change-email-api-resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

## Integration
resource "aws_api_gateway_integration" "confirm-change-email-lambda-api-integration" {
  rest_api_id             = var.app_gateway_id
  resource_id             = aws_api_gateway_resource.confirm-change-email-api-resource.id
  http_method             = aws_api_gateway_method.confirm-change-email-method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.confirm-change-email-function-handler.invoke_arn
}

# /user/cancel_change_email
## Resource
resource "aws_api_gateway_resource" "cancel-change-email-api-resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.user-app-resource.id
  path_part   = "cancel_change_email"
}

## Method
resource "aws_api_gateway_method" "cancel-change-email-method" {
  rest_api_id      = var.app_gateway_id
  resource_id      = aws_api_gateway_resource.cancel-change-email-api-resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

## Integration
resource "aws_api_gateway_integration" "cancel-change-email-lambda-api-integration" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.cancel-change-email-api-resource.id
  http_method             = aws_api_gateway_method.cancel-change-email-method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.cancel-change-email-function-handler.invoke_arn
}



