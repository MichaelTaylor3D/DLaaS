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
  etag   = filemd5(data.archive_file.create-schema-function-source.output_path)
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

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = filebase64sha256(data.archive_file.create-schema-function-source.output_path)
}

### END Create User Schema LAMBDA ###