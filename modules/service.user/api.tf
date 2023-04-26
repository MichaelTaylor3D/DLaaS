resource "aws_api_gateway_authorizer" "custom_authorizer" {
  name                   = "custom_authorizer"
  type                   = "REQUEST"
  authorizer_uri         = "${aws_lambda_function.authorizer-function-handler.invoke_arn}"
  authorizer_result_ttl_in_seconds = 300
  identity_validation_expression = "^(Bearer|Basic)\s+([^\s]+)$"
  authorizer_credentials = "${aws_iam_role.example_authorizer_role.arn}"
}

resource "aws_api_gateway_resource" "v1-api-resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = var.root_resource_id
  path_part   = "user"
}

resource "aws_api_gateway_resource" "user-api-resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.v1-api-resource.id
  path_part   = "v1"
}

# /user/create
resource "aws_api_gateway_resource" "create-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.user-api-resource.id

    path_part   = "create"
}

# /user/confirm
resource "aws_api_gateway_resource" "confirm-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.user-api-resource.id

    path_part   = "confirm"
}

# /user/login
resource "aws_api_gateway_resource" "login-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.user-api-resource.id

    path_part   = "login"
}

# /user/reset_password
resource "aws_api_gateway_resource" "reset-password-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.user-api-resource.id

    path_part   = "reset_password"
}

# /user/confirm_new_password
resource "aws_api_gateway_resource" "confirm-new-password-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.user-api-resource.id

    path_part   = "confirm_new_password"
}

# /user/change_email
resource "aws_api_gateway_resource" "change-email-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.user-api-resource.id

    path_part   = "change_email"
}

# /user/confirm_change_email
resource "aws_api_gateway_resource" "confirm-change-email-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.user-api-resource.id

    path_part   = "confirm_change_email"
}

# /user/cancel_change_email
resource "aws_api_gateway_resource" "cancel-change-email-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.user-api-resource.id

    path_part   = "cancel_change_email"
}

# /user/list_access_keys
resource "aws_api_gateway_resource" "access-keys-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.user-api-resource.id

    path_part   = "access_keys"
}

resource "aws_api_gateway_resource" "delete-access-key-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.access-keys-api-resource.id

    path_part   = "{accessKey}"
}

resource "aws_api_gateway_method" "delete-access-key-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.delete-access-key-api-resource.id
  http_method      = "DELETE"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_method" "create-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.create-api-resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_method" "reset-password-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.reset-password-api-resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_method" "confirm-new-password-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.confirm-new-password-api-resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_method" "change-email-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.change-email-api-resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_method" "cancel-change-email-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.cancel-change-email-api-resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_method" "confirm-change-email-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.confirm-change-email-api-resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_method" "generate-access-key-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.access-keys-api-resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_method" "list-access-keys-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.access-keys-api-resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_method" "confirm-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.confirm-api-resource.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_method" "login-method" {
  rest_api_id      = var.api_gateway_id
  resource_id      = aws_api_gateway_resource.login-api-resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_integration" "create-method-lambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = var.api_gateway_id
    resource_id             = aws_api_gateway_resource.create-api-resource.id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.create-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.create-user-function-handler.invoke_arn
}

resource "aws_api_gateway_integration" "confirm-method-lambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = var.api_gateway_id
    resource_id             = aws_api_gateway_resource.confirm-api-resource.id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.confirm-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.confirm-user-function-handler.invoke_arn
}

resource "aws_api_gateway_integration" "login-method-lambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = var.api_gateway_id
    resource_id             = aws_api_gateway_resource.login-api-resource.id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.login-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.login-function-handler.invoke_arn
}

resource "aws_api_gateway_integration" "generate-access-key-lambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = var.api_gateway_id
    resource_id             = aws_api_gateway_resource.access-keys-api-resource.id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.generate-access-key-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.generate-access-key-function-handler.invoke_arn
}

resource "aws_api_gateway_integration" "list-access-keys-lambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = var.api_gateway_id
    resource_id             = aws_api_gateway_resource.access-keys-api-resource.id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.list-access-keys-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.list-access-keys-function-handler.invoke_arn
}

resource "aws_api_gateway_integration" "delete-access-keyslambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = var.api_gateway_id
    resource_id             = aws_api_gateway_resource.delete-access-key-api-resource.id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.delete-access-key-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.delete-access-key-function-handler.invoke_arn
}

resource "aws_api_gateway_integration" "reset-password-lambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = var.api_gateway_id
    resource_id             = aws_api_gateway_resource.reset-password-api-resource.id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.reset-password-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.reset-password-function-handler.invoke_arn
}

resource "aws_api_gateway_integration" "confirm-new-password-lambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = var.api_gateway_id
    resource_id             = aws_api_gateway_resource.confirm-new-password-api-resource.id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.confirm-new-password-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.confirm-new-password-function-handler.invoke_arn
}

resource "aws_api_gateway_integration" "change-email-lambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = var.api_gateway_id
    resource_id             = aws_api_gateway_resource.change-email-api-resource.id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.change-email-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.change-email-function-handler.invoke_arn
}

resource "aws_api_gateway_integration" "cancel-change-email-lambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = var.api_gateway_id
    resource_id             = aws_api_gateway_resource.cancel-change-email-api-resource.id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.cancel-change-email-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.cancel-change-email-function-handler.invoke_arn
}

resource "aws_api_gateway_integration" "confirm-change-email-lambda-api-integration" {
    # ID of the REST API and the endpoint at which to integrate a lambda function
    rest_api_id             = var.api_gateway_id
    resource_id             = aws_api_gateway_resource.confirm-change-email-api-resource.id

    # ID of the HTTP method at which to integrate with the lambda function
    http_method             = aws_api_gateway_method.confirm-change-email-method.http_method

    # Lambdas can only be invoked via HTTP POST
    integration_http_method = "POST"
    type                    = "AWS_PROXY"

    # The URI at which the API is invoked
    uri                     = aws_lambda_function.confirm-change-email-function-handler.invoke_arn
}





