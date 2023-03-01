resource "aws_api_gateway_resource" "worker-api-resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = var.root_resource_id
  path_part   = "worker"
}

resource "aws_api_gateway_resource" "v1-api-resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.worker-api-resource.id
  path_part   = "v1"
}

# /user/v1/create_mirror
resource "aws_api_gateway_resource" "create-mirror-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.v1-api-resource.id

    path_part   = "create_mirror"
}

resource "aws_api_gateway_method" "create-mirror-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.create-mirror-api-resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_integration" "create-mirror-method-lambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = var.api_gateway_id
    resource_id             = aws_api_gateway_resource.create-api-resource.id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.create-mirror-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.create-mirror-function-handler.invoke_arn
}