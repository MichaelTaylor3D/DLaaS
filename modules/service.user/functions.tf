resource "random_uuid" "archive" { }

### START Create User LAMBDA ###

data "archive_file" "create-user-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/create_user"
  output_path = "${path.module}/lambdas/create-user-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "create-user-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/create-user-tf-handler.zip"
  source = data.archive_file.create-user-function-source.output_path
  etag   = filemd5(data.archive_file.create-user-function-source.output_path)
}

# Lamda Initialization
resource "aws_lambda_function" "create-user-function-handler" {
  function_name     = "create-user-handler"
  description       = "${var.aws_profile}: Create new user function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.create-user-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = filebase64sha256(data.archive_file.create-user-function-source.output_path)
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "create-user-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.create-user-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END Create User  LAMBDA ###

### START Confirm Account LAMBDA ###

data "archive_file" "confirm-user-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/confirm_user"
  output_path = "${path.module}/lambdas/confirm-user-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "confirm-user-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/confirm-user-tf-handler.zip"
  source = data.archive_file.confirm-user-function-source.output_path
  etag   = filemd5(data.archive_file.confirm-user-function-source.output_path)
}

# Lamda Initialization
resource "aws_lambda_function" "confirm-user-function-handler" {
  function_name     = "confirm-user-handler"
  description       = "${var.aws_profile}: Confirm User Account function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.confirm-user-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = filebase64sha256(data.archive_file.confirm-user-function-source.output_path)
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "confirm-user-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.confirm-user-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END Confirm Account  LAMBDA ###

### START Confirm Account LAMBDA ###

data "archive_file" "login-user-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/login"
  output_path = "${path.module}/lambdas/login-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "login-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/login-tf-handler.zip"
  source = data.archive_file.login-function-source.output_path
  etag   = filemd5(data.archive_file.login-function-source.output_path)
}

# Lamda Initialization
resource "aws_lambda_function" "login-function-handler" {
  function_name     = "login-handler"
  description       = "${var.aws_profile}: Login User Account function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.login-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = filebase64sha256(data.archive_file.login-function-source.output_path)
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "login-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.login-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END Confirm Account  LAMBDA ###
