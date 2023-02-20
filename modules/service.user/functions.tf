resource "random_uuid" "archive" { }

### START POST JOB LAMBDA ###

data "archive_file" "post-job-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/post-job"
  output_path = "${path.module}/lambdas/post-job-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "post-job-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/post-job-tf-handler.zip"
  source = data.archive_file.post-job-function-source.output_path
  etag   = filemd5(data.archive_file.post-job-function-source.output_path)
}

# Lamda Initialization
resource "aws_lambda_function" "post-job-function-handler" {
  function_name     = "post-job-handler"
  description       = "${var.aws_profile}: Post Job to job queue"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.post-job-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs10.x"
  timeout           = 60

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = filebase64sha256(data.archive_file.post-job-function-source.output_path)
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "post-job-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.post-job-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END POST JOB LAMBDA ###

### START QUEUE JOB TRIGGER LAMBDA ###


data "archive_file" "queue-job-s3-trigger-source-directory" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/queue-job-s3-trigger"
  output_path = "${path.module}/lambdas/queue-job-s3-trigger-handler-${random_uuid.archive.result}.zip"
}

resource "aws_s3_bucket_object" "queue-job-s3-trigger-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/creator-queue-job-trigger-tf-handler.zip"
  source = data.archive_file.queue-job-s3-trigger-source-directory.output_path
  etag   = data.archive_file.queue-job-s3-trigger-source-directory.output_md5
}

resource "aws_lambda_function" "queue-job-s3-trigger-handler" {
  function_name     = "queue-job-s3-trigger-handler"
  description       = "${var.aws_profile}: S3 Trigger to queue jobs after the job files where uploaded to the job folder"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.queue-job-s3-trigger-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler          = "index.handler"
  runtime          = "nodejs10.x"
  timeout           = 60

  # IAM role for lambda defined below
  role             = var.default_lambda_role_arn
  publish          = true
  source_code_hash = data.archive_file.queue-job-s3-trigger-source-directory.output_base64sha256
}

resource "aws_lambda_permission" "queue-job-s3-trigger-lambda-invoke" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.queue-job-s3-trigger-handler.arn
  principal     = "s3.amazonaws.com"
  source_arn    = "arn:aws:s3:::${var.storage_bucket_id}"
}

output s3_trigger_arn { value = aws_lambda_function.queue-job-s3-trigger-handler.arn }

### END QUEUE JOB TRIGGER LAMBDA ###

### START GET USER ASSETS LAMBDA ###

data "archive_file" "get-user-assets-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/get-user-assets"
  output_path = "${path.module}/lambdas/get-user-assets-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "get-user-assets-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/get-user-assets-tf-handler.zip"
  source = data.archive_file.get-user-assets-function-source.output_path
  etag   = filemd5(data.archive_file.get-user-assets-function-source.output_path)
}

# Lamda Initialization
resource "aws_lambda_function" "get-user-assets-function-handler" {
  function_name     = "get-user-assets-handler"
  description       = "${var.aws_profile}: Get the job results for a user"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.get-user-assets-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs10.x"
  timeout           = 60

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = filebase64sha256(data.archive_file.get-user-assets-function-source.output_path)
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "get-user-assets-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.get-user-assets-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END GET USER ASSETS LAMBDA ###

### START INSTANCE REFRESH LAMBDA ###

data "archive_file" "start-instance-refresh-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/start-instance-refresh"
  output_path = "${path.module}/lambdas/start-instance-refresh-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "start-instance-refresh-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/start-instance-refresh-tf-handler.zip"
  source = data.archive_file.start-instance-refresh-function-source.output_path
  etag   = filemd5(data.archive_file.start-instance-refresh-function-source.output_path)
}

# Lamda Initialization
resource "aws_lambda_function" "start-instance-refresh-function-handler" {
  function_name     = "start-instance-refresh-handler"
  description       = "${var.aws_profile}: Start Instance Refresh on the Job Queue Workers"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.start-instance-refresh-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs10.x"
  timeout           = 60

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = filebase64sha256(data.archive_file.start-instance-refresh-function-source.output_path)
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "start-instance-refresh-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.start-instance-refresh-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END GET USER ASSETS LAMBDA ###

