resource "random_uuid" "archive" { }

### START Authorizer LAMBDA ###

data "archive_file" "authorizer-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/authorizer"
  output_path = "${path.module}/lambdas/authorizer-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "authorizer-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/authorizer-tf-handler.zip"
  source = data.archive_file.authorizer-function-source.output_path
  etag   = data.archive_file.authorizer-function-source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "authorizer-function-handler" {
  function_name     = "authorizer"
  description       = "${var.aws_profile}: Custom Authorizer function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.authorizer-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.authorizer-function-source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "authorizer-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.authorizer-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END Authorizer LAMBDA ###

### START register User LAMBDA ###

data "archive_file" "register-user-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/register_user"
  output_path = "${path.module}/lambdas/register-user-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "register-user-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/register-user-tf-handler.zip"
  source = data.archive_file.register-user-function-source.output_path
  etag   = data.archive_file.register-user-function-source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "register-user-function-handler" {
  function_name     = "register-user-handler"
  description       = "${var.aws_profile}: register new user function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.register-user-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.register-user-function-source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "register-user-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.register-user-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END register User  LAMBDA ###

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
  etag   = data.archive_file.confirm-user-function-source.output_md5
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

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.confirm-user-function-source.output_base64sha256
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

data "archive_file" "login-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/login"
  output_path = "${path.module}/lambdas/login-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "login-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/login-tf-handler.zip"
  source = data.archive_file.login-function-source.output_path
  etag   = data.archive_file.login-function-source.output_md5
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

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.login-function-source.output_base64sha256
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

### START Generate Access Key LAMBDA ###

data "archive_file" "generate-access-key-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/generate_client_access_key"
  output_path = "${path.module}/lambdas/generate-access-key-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "generate-access-key-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/generate-access-key-tf-handler.zip"
  source = data.archive_file.generate-access-key-function-source.output_path
  etag   = data.archive_file.generate-access-key-function-source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "generate-access-key-function-handler" {
  function_name     = "generate-access-key-handler"
  description       = "${var.aws_profile}: Generate Access Key function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.generate-access-key-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.generate-access-key-function-source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "generate-access-key-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.generate-access-key-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END Generate Access Key LAMBDA ###

### START List Access Key LAMBDA ###

data "archive_file" "list-access-keys-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/list_access_keys"
  output_path = "${path.module}/lambdas/list-access-keys-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "list-access-keys-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/list-access-keys-tf-handler.zip"
  source = data.archive_file.list-access-keys-function-source.output_path
  etag   = data.archive_file.list-access-keys-function-source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "list-access-keys-function-handler" {
  function_name     = "list-access-keys-handler"
  description       = "${var.aws_profile}: List Access Keys function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.list-access-keys-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.list-access-keys-function-source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "list-access-keys-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.list-access-keys-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END List Access Key LAMBDA ###

### START Delete Access Key LAMBDA ###

data "archive_file" "delete-access-key-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/delete_access_key"
  output_path = "${path.module}/lambdas/delete-access-key-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "delete-access-key-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/delete-access-key-tf-handler.zip"
  source = data.archive_file.delete-access-key-function-source.output_path
  etag   = data.archive_file.delete-access-key-function-source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "delete-access-key-function-handler" {
  function_name     = "delete-access-key-handler"
  description       = "${var.aws_profile}: Delete Access Key function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.delete-access-key-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.delete-access-key-function-source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "delete-access-key-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.delete-access-key-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END Delete Access Key LAMBDA ###

### START Reset Password Key LAMBDA ###

data "archive_file" "reset-password-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/reset_password"
  output_path = "${path.module}/lambdas/reset-password-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "reset-password-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/reset-password-tf-handler.zip"
  source = data.archive_file.reset-password-function-source.output_path
  etag   = data.archive_file.reset-password-function-source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "reset-password-function-handler" {
  function_name     = "reset-password-handler"
  description       = "${var.aws_profile}: Reset Password function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.reset-password-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.reset-password-function-source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "reset-password-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.reset-password-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END Reset Password Key LAMBDA ###

### START Confirm Password Key LAMBDA ###

data "archive_file" "confirm-new-password-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/confirm_new_password"
  output_path = "${path.module}/lambdas/confirm-new-password-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "confirm-new-password-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/confirm-new-password-tf-handler.zip"
  source = data.archive_file.confirm-new-password-function-source.output_path
  etag   = data.archive_file.confirm-new-password-function-source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "confirm-new-password-function-handler" {
  function_name     = "confirm-new-password-handler"
  description       = "${var.aws_profile}: Confirm New Password function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.confirm-new-password-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.confirm-new-password-function-source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "confirm-new-password-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.confirm-new-password-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END Confirm Password Key LAMBDA ###

### START Change Email LAMBDA ###

data "archive_file" "change-email-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/change_email"
  output_path = "${path.module}/lambdas/change-email-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "change-email-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/change-email-tf-handler.zip"
  source = data.archive_file.change-email-function-source.output_path
  etag   = data.archive_file.change-email-function-source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "change-email-function-handler" {
  function_name     = "change-email-handler"
  description       = "${var.aws_profile}: Change Email function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.change-email-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.change-email-function-source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "change-email-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.change-email-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END Change Email LAMBDA ###

### START Cancel Change Email LAMBDA ###

data "archive_file" "cancel-change-email-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/cancel_change_email"
  output_path = "${path.module}/lambdas/cancel-change-email-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "cancel-change-email-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/cancel-change-email-tf-handler.zip"
  source = data.archive_file.cancel-change-email-function-source.output_path
  etag   = data.archive_file.cancel-change-email-function-source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "cancel-change-email-function-handler" {
  function_name     = "cancel-change-email-handler"
  description       = "${var.aws_profile}: Cancel Change Email function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.cancel-change-email-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.cancel-change-email-function-source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "cancel-change-email-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.cancel-change-email-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END Cancel Change Email LAMBDA ###

### START Confirm Change Email LAMBDA ###

data "archive_file" "confirm-change-email-function-source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/confirm_change_email"
  output_path = "${path.module}/lambdas/confirm-change-email-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "confirm-change-email-function-storage-upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/confirm-change-email-tf-handler.zip"
  source = data.archive_file.confirm-change-email-function-source.output_path
  etag   = data.archive_file.confirm-change-email-function-source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "confirm-change-email-function-handler" {
  function_name     = "confirm-change-email-handler"
  description       = "${var.aws_profile}: Confirm Change Email function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.confirm-change-email-function-storage-upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  layers = [var.lambda_layer_arn]

  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.confirm-change-email-function-source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "confirm-change-email-api-gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.confirm-change-email-function-handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END Confirm Change Email LAMBDA ###

### START token_refresh LAMBDA ###

data "archive_file" "token_refresh_function_source" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas/token_refresh"
  output_path = "${path.module}/lambdas/token-refresh-tf-handler-${random_uuid.archive.result}.zip"
}

# Upload Lamda function to S3
resource "aws_s3_bucket_object" "token_refresh_function_storage_upload" {
  bucket = var.dev_bucket_id
  key    = "lambdas/token-refresh-tf-handler.zip"
  source = data.archive_file.token_refresh_function_source.output_path
  etag   = data.archive_file.token_refresh_function_source.output_md5
}

# Lamda Initialization
resource "aws_lambda_function" "token_refresh_function_handler" {
  function_name     = "token-refresh-handler"
  description       = "${var.aws_profile}: Token Refresh function"
  s3_bucket         = var.dev_bucket_id
  s3_key            = aws_s3_bucket_object.token_refresh_function_storage_upload.key

  # Entrypoint to lambda function. Format is <file-name>.<property-name>
  handler           = "index.handler"
  runtime           = "nodejs16.x"
  timeout           = 60

  layers = [var.lambda_layer_arn]
  
  # IAM role for lambda defined below
  role              = var.default_lambda_role_arn
  publish           = true
  source_code_hash  = data.archive_file.token_refresh_function_source.output_base64sha256
}

# Give permission to the API gateway to access this lambda
resource "aws_lambda_permission" "token_refresh_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"

  # Name of lambda from above
  function_name = aws_lambda_function.token_refresh_function_handler.arn
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"

  # Link to execution arn of API Gateway REST API
  # The "/*/*" portion grants access to any method, any resource within API Gateway
  source_arn    = "${var.api_gateway_arn}/*/*"
}

### END token_refresh LAMBDA ###
