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
