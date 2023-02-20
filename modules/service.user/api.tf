resource "aws_api_gateway_resource" "v1-api-resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = var.root_resource_id
  path_part   = "v1"
}

resource "aws_api_gateway_resource" "user-api-resource" {
  rest_api_id = var.api_gateway_id
  parent_id   = aws_api_gateway_resource.v1-api-resource.id
  path_part   = "user"
}

# /user/create
resource "aws_api_gateway_resource" "create-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.user-api-resource.id

    path_part   = "create"
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

# /user/generate_access_key
resource "aws_api_gateway_resource" "generate-access-key-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.user-api-resource.id

    path_part   = "generate_access_key"
}

# /user/list_access_keys
resource "aws_api_gateway_resource" "list-access-keys-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.user-api-resource.id

    path_part   = "list_access_keys"
}

# /user/delete_access_key
resource "aws_api_gateway_resource" "delete-access-key-api-resource" {
    # ID to AWS API Gateway Rest API definition above
    rest_api_id = var.api_gateway_id
    parent_id   = aws_api_gateway_resource.user-api-resource.id

    path_part   = "delete_access_key"
}
