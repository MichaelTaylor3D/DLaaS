resource "random_uuid" "archive" { }

### START upload LAMBDA ###

data "archive_file" "upload_function_source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/upload"
  output_path = "${path.module}/lambdas/upload-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "upload_function_storage_upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/upload-tf-handler.zip"
  source = data.archive_file.upload_function_source.output_path
  etag   = data.archive_file.upload_function_source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "upload_function_handler" {
  function_name     = "upload-handler"
  description       = "${var.aws_profile}: Upload function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.upload_function_storage_upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.upload_function_source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "upload_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.upload_function_handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${aws_api_gateway_rest_api.plugin_service.execution_arn}/*/*"
}

### END upload LAMBDA ###

### START handle_upload LAMBDA ###

data "archive_file" "handle_upload_function_source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/handle_upload"
  output_path = "${path.module}/lambdas/handle-upload-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "handle_upload_function_storage_upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/handle-upload-tf-handler.zip"
  source = data.archive_file.handle_upload_function_source.output_path
  etag   = data.archive_file.handle_upload_function_source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "handle_upload_function_handler" {
  function_name     = "handle-upload-handler"
  description       = "${var.aws_profile}: Handle Upload function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.handle_upload_function_storage_upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.handle_upload_function_source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "handle_upload_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.handle_upload_function_handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${aws_api_gateway_rest_api.plugin_service.execution_arn}/*/*"
}

### END handle_upload LAMBDA ###

### START add_missing_files LAMBDA ###

data "archive_file" "add_missing_files_function_source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/add_missing_files"
  output_path = "${path.module}/lambdas/add-missing-files-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "add_missing_files_function_storage_upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/add-missing-files-tf-handler.zip"
  source = data.archive_file.add_missing_files_function_source.output_path
  etag   = data.archive_file.add_missing_files_function_source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "add_missing_files_function_handler" {
  function_name     = "add-missing-files-handler"
  description       = "${var.aws_profile}: Add Missing Files function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.add_missing_files_function_storage_upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.add_missing_files_function_source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "add_missing_files_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.add_missing_files_function_handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${aws_api_gateway_rest_api.plugin_service.execution_arn}/*/*"
}

### END add_missing_files LAMBDA ###

### START plugin_info LAMBDA ###

data "archive_file" "plugin_info_function_source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/plugin_info"
  output_path = "${path.module}/lambdas/plugin-info-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "plugin_info_function_storage_upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/plugin-info-tf-handler.zip"
  source = data.archive_file.plugin_info_function_source.output_path
  etag   = data.archive_file.plugin_info_function_source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "plugin_info_function_handler" {
  function_name     = "plugin-info-handler"
  description       = "${var.aws_profile}: Plugin Info function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.plugin_info_function_storage_upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.plugin_info_function_source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "plugin_info_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.plugin_info_function_handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${aws_api_gateway_rest_api.plugin_service.execution_arn}/*/*"
}

### END plugin_info LAMBDA ###
