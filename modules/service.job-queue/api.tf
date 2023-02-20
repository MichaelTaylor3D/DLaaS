resource "aws_api_gateway_resource" "v1-api-resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = var.root_resource_id
  path_part   = "v1"
}

resource "aws_api_gateway_resource" "job-api-resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.v1-api-resource.id
  path_part   = "job"
}

resource "aws_api_gateway_resource" "system-api-resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.v1-api-resource.id
  path_part   = "system"
}

resource "aws_api_gateway_resource" "user-api-resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.v1-api-resource.id
  path_part   = "user"
}

# /user/:userid
resource "aws_api_gateway_resource" "userid-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.user-api-resource.id

    path_part   = "{user_id}"
}

## INTEGRATIONS

resource "aws_api_gateway_method" "post-new-job-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.job-api-resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "post-new-job-method-lambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = var.api_gateway_id
    resource_id             = aws_api_gateway_resource.job-api-resource.id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.post-new-job-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.post-job-function-handler.invoke_arn
}

resource "aws_api_gateway_method" "get-user-assets-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.userid-api-resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "get-user-assets-method-lambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = aws_api_gateway_method.get-user-assets-method.rest_api_id
    resource_id             = aws_api_gateway_method.get-user-assets-method.resource_id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.get-user-assets-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.get-user-assets-function-handler.invoke_arn
}

resource "aws_api_gateway_method" "start-instance-refresh-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.system-api-resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "start-instance-refresh-method-lambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = aws_api_gateway_method.start-instance-refresh-method.rest_api_id
    resource_id             = aws_api_gateway_method.start-instance-refresh-method.resource_id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.start-instance-refresh-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.start-instance-refresh-function-handler.invoke_arn
}



