/**
 * @fileoverview This Terraform configuration file manages the creation and deployment of
 * an AWS Lambda function responsible for creating a database schema. The configuration
 * includes the following steps:
 * 1. Create a ZIP archive of the Lambda function source code.
 * 2. Upload the ZIP archive to an S3 bucket.
 * 3. Create and configure the Lambda function, specifying the S3 bucket and key
 *    for the source code, the handler, runtime, timeout, IAM role, and publish settings.
 */


### START Create user Schema LAMBDA ###

data "archive_file" "create-schema-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/create_schema"
  output_path = "${path.module}/lambdas/create-schema-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "create-schema-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/create-schema-tf-handler.zip"
  source = data.archive_file.create-schema-function-source.output_path
  etag   = data.archive_file.create-schema-function-source.output_md5
}

# Lambda Initialization
resource "aws_lambda_function" "create-schema-function-handler" {
  function_name     = "create-schema-handler"
  description       = "${var.aws_profile}: Create db schema"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.create-schema-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.create-schema-function-source.output_base64sha256
}

### END Create User Schema LAMBDA ###

data "archive_file" "list-s3-files-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/list-s3-files"
  output_path = "${path.module}/lambdas/list-s3-files-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lambda function to S3
resource "aws_s3_bucket_object" "list-s3-files-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/list-s3-files-tf-handler.zip"
  source = data.archive_file.list-s3-files-function-source.output_path
  etag   = data.archive_file.list-s3-files-function-source.output_md5
}

# Lambda Initialization
resource "aws_lambda_function" "list-s3-files-function-handler" {
  function_name     = "list-s3-files-handler"
  description       = "${var.aws_profile}: List files in S3"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.list-s3-files-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.list-s3-files-function-source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "list-s3-files-function-handler" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.list-s3-files-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### START S3 Trigger Invalidate CDN LAMBDA ###

data "archive_file" "invalidate_cdn_function_source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/s3-trigger-invalidate-cdn"
  output_path = "${path.module}/lambdas/s3-trigger-invalidate-cdn-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lambda function to S3
resource "aws_s3_bucket_object" "invalidate_cdn_function_storage_upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/s3-trigger-invalidate-cdn-tf-handler.zip"
  source = data.archive_file.invalidate_cdn_function_source.output_path
  etag   = data.archive_file.invalidate_cdn_function_source.output_md5
}

# Lambda Initialization
resource "aws_lambda_function" "invalidate_cdn_function_handler" {
  function_name     = "s3-trigger-invalidate-cdn-handler"
  description       = "${var.aws_profile}: Invalidate CDN on S3 changes"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.invalidate_cdn_function_storage_upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.invalidate_cdn_function_source.output_base64sha256
}

### END S3 Trigger Invalidate CDN LAMBDA ###

### START Send Route53 Availability Email LAMBDA ###

data "archive_file" "send_route53_email_function_source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/send_route53_available_email"  // Replace this with the path to your Lambda function's source code
  output_path = "${path.module}/lambdas/send-route53-email-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lambda function to S3
resource "aws_s3_bucket_object" "send_route53_email_function_storage_upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/send-route53-email-tf-handler.zip"
  source = data.archive_file.send_route53_email_function_source.output_path
  etag   = data.archive_file.send_route53_email_function_source.output_md5
}

# Lambda Initialization
resource "aws_lambda_function" "send_route53_email_function_handler" {
  function_name     = "send-route53-email-handler"
  description       = "${var.aws_profile}: Send Route53 Availability Email"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.send_route53_email_function_storage_upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 900

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.send_route53_email_function_source.output_base64sha256
}

### END Send Route53 Availability Email LAMBDA ###
