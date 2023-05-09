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
resource "aws_api_gateway_resource" "get_files_api_resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.system_v1_api_resource.id
  path_part   = "get_files"
}

resource "aws_api_gateway_method" "get_files_method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.get_files_api_resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

# Integration response for GET method
# Integration for GET method
resource "aws_api_gateway_integration" "get_files_lambda_api_integration" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.get_files_api_resource.id
  http_method             = aws_api_gateway_method.get_files_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.list-s3-files-function-handler.invoke_arn
}

# CORS
resource "aws_api_gateway_method" "get_files_options" {
  rest_api_id = var.api_gateway_id
  resource_id = aws_api_gateway_resource.get_files_api_resource.id
  http_method = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_files_options_integration" {
  rest_api_id = var.api_gateway_id
  resource_id = aws_api_gateway_resource.get_files_api_resource.id
  http_method = aws_api_gateway_method.get_files_options.http_method
  type = "MOCK"
}

resource "aws_api_gateway_method_response" "get_files_options_200_response" {
  rest_api_id = var.api_gateway_id
  resource_id = aws_api_gateway_resource.get_files_api_resource.id
  http_method = aws_api_gateway_method.get_files_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration_response" "get_files_options_response" {
  rest_api_id = var.api_gateway_id
  resource_id = aws_api_gateway_resource.get_files_api_resource.id
  http_method = aws_api_gateway_method.get_files_options.http_method
  status_code = aws_api_gateway_method_response.get_files_options_200_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'https://cdn.${var.service_domain}'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
  }
}

# Method response for GET method
resource "aws_api_gateway_method_response" "get_files_get_method_response" {
  rest_api_id = var.api_gateway_id
  resource_id = aws_api_gateway_resource.get_files_api_resource.id
  http_method = aws_api_gateway_method.get_files_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}


