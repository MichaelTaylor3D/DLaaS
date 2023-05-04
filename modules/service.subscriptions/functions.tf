resource "random_uuid" "archive" { }

### START create_subscription LAMBDA ###

data "archive_file" "create_subscription_function_source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/create_subscription"
  output_path = "${path.module}/lambdas/create-subscription-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "create_subscription_function_storage_upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/create-subscription-tf-handler.zip"
  source = data.archive_file.create_subscription_function_source.output_path
  etag   = data.archive_file.create_subscription_function_source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "create_subscription_function_handler" {
  function_name     = "create-subscription-handler"
  description       = "${var.aws_profile}: create subscription function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.create_subscription_function_storage_upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.create_subscription_function_source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "create_subscription_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.create_subscription_function_handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END create_subscription LAMBDA ###

### START view_invoice LAMBDA ###

data "archive_file" "view_invoice_function_source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/view_invoice"
  output_path = "${path.module}/lambdas/view-invoice-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "view_invoice_function_storage_upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/view-invoice-tf-handler.zip"
  source = data.archive_file.view_invoice_function_source.output_path
  etag   = data.archive_file.view_invoice_function_source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "view_invoice_function_handler" {
  function_name     = "view-invoice-handler"
  description       = "${var.aws_profile}: view invoice function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.view_invoice_function_storage_upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.view_invoice_function_source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "view_invoice_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.view_invoice_function_handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.app_gateway_arn}/*/*"
}


### END view_invoice LAMBDA ###