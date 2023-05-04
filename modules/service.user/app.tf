# User App Resource
resource "aws_api_gateway_resource" "user_app_resource" {
  rest_api_id = var.app_gateway_id
  parent_id   = var.app_root_resource_id
  path_part   = "user"
}

# /user/confirm_change_email
## Resource
resource "aws_api_gateway_resource" "confirm_change_email_api_resource" {
  rest_api_id = var.app_gateway_id
  parent_id   = aws_api_gateway_resource.user_app_resource.id
  path_part   = "confirm_change_email"
}

## Method
resource "aws_api_gateway_method" "confirm_change_email_method" {
  rest_api_id      = var.app_gateway_id
  resource_id      = aws_api_gateway_resource.confirm_change_email_api_resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

## Integration
resource "aws_api_gateway_integration" "confirm_change_email_lambda_api_integration" {
  rest_api_id             = var.app_gateway_id
  resource_id             = aws_api_gateway_resource.confirm_change_email_api_resource.id
  http_method             = aws_api_gateway_method.confirm_change_email_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.confirm-change-email-function-handler.invoke_arn
}

# /user/cancel_change_email
## Resource
resource "aws_api_gateway_resource" "cancel_change_email_api_resource" {
  rest_api_id = var.app_gateway_id
  parent_id   = aws_api_gateway_resource.user_app_resource.id
  path_part   = "cancel_change_email"
}

## Method
resource "aws_api_gateway_method" "cancel_change_email_method" {
  rest_api_id      = var.app_gateway_id
  resource_id      = aws_api_gateway_resource.cancel_change_email_api_resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

## Integration
resource "aws_api_gateway_integration" "cancel_change_email_lambda_api_integration" {
  rest_api_id             = var.app_gateway_id
  resource_id             = aws_api_gateway_resource.cancel_change_email_api_resource.id
  http_method             = aws_api_gateway_method.cancel_change_email_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.cancel-change-email-function-handler.invoke_arn
}

# /user/confirm
resource "aws_api_gateway_resource" "confirm-app-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.app_gateway_id
    parent_id   = aws_api_gateway_resource.user_app_resource.id

    path_part   = "confirm"
}

resource "aws_api_gateway_method" "confirm-method" {
  rest_api_id      = var.app_gateway_id
  resource_id      = aws_api_gateway_resource.confirm-app-resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}


resource "aws_api_gateway_integration" "confirm-method-lambda-app-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = var.app_gateway_id
    resource_id             = aws_api_gateway_resource.confirm-app-resource.id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.confirm-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.confirm-user-function-handler.invoke_arn
}