# /upload
resource "aws_api_gateway_resource" "upload_api_resource" {
  rest_api_id = aws_api_gateway_rest_api.plugin_service.id
  parent_id   = aws_api_gateway_rest_api.plugin_service.root_resource_id
  path_part   = "upload"
}

resource "aws_api_gateway_method" "upload_method" {
  rest_api_id      = aws_api_gateway_rest_api.plugin_service.id
  resource_id      = aws_api_gateway_resource.upload_api_resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_integration" "upload_lambda_api_integration" {
  rest_api_id             = aws_api_gateway_rest_api.plugin_service.id
  resource_id             = aws_api_gateway_resource.upload_api_resource.id
  http_method             = aws_api_gateway_method.upload_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.upload_function_handler.invoke_arn
}

# /handle_upload
resource "aws_api_gateway_resource" "handle_upload_api_resource" {
  rest_api_id = aws_api_gateway_rest_api.plugin_service.id
  parent_id   = aws_api_gateway_rest_api.plugin_service.root_resource_id
  path_part   = "handle_upload"
}

resource "aws_api_gateway_method" "handle_upload_method" {
  rest_api_id      = aws_api_gateway_rest_api.plugin_service.id
  resource_id      = aws_api_gateway_resource.handle_upload_api_resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_integration" "handle_upload_lambda_api_integration" {
  rest_api_id             = aws_api_gateway_rest_api.plugin_service.id
  resource_id             = aws_api_gateway_resource.handle_upload_api_resource.id
  http_method             = aws_api_gateway_method.handle_upload_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.handle_upload_function_handler.invoke_arn
}

# /add_missing_files
resource "aws_api_gateway_resource" "add_missing_files_api_resource" {
  rest_api_id = aws_api_gateway_rest_api.plugin_service.id
  parent_id   = aws_api_gateway_rest_api.plugin_service.root_resource_id
  path_part   = "add_missing_files"
}

resource "aws_api_gateway_method" "add_missing_files_method" {
  rest_api_id      = aws_api_gateway_rest_api.plugin_service.id
  resource_id      = aws_api_gateway_resource.add_missing_files_api_resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_integration" "add_missing_files_lambda_api_integration" {
  rest_api_id             = aws_api_gateway_rest_api.plugin_service.id
  resource_id             = aws_api_gateway_resource.add_missing_files_api_resource.id
  http_method             = aws_api_gateway_method.add_missing_files_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.add_missing_files_function_handler.invoke_arn
}

# /plugin_info
resource "aws_api_gateway_resource" "plugin_info_api_resource" {
  rest_api_id = aws_api_gateway_rest_api.plugin_service.id
  parent_id   = aws_api_gateway_rest_api.plugin_service.root_resource_id
  path_part   = "plugin_info"
}

resource "aws_api_gateway_method" "plugin_info_method" {
  rest_api_id      = aws_api_gateway_rest_api.plugin_service.id
  resource_id      = aws_api_gateway_resource.plugin_info_api_resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_integration" "plugin_info_lambda_api_integration" {
  rest_api_id             = aws_api_gateway_rest_api.plugin_service.id
  resource_id             = aws_api_gateway_resource.plugin_info_api_resource.id
  http_method             = aws_api_gateway_method.plugin_info_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.plugin_info_function_handler.invoke_arn
}

