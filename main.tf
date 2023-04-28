terraform {
  backend "remote" {
    organization = "TaylorDigitalServices"

    workspaces {
      name = "DatalayerStorageService"
    }
  }
}

provider "aws" {
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  region     = var.aws_region
}

module "service-system-utils" {
  source                     = "./modules/service.system-utils"

  # AWS Profile
  aws_access_key              = var.aws_access_key
  aws_secret_key              = var.aws_secret_key
  aws_region                  = var.aws_region
  aws_profile                 = var.aws_profile

  # Storage
  dev_bucket_id               = aws_s3_bucket.storage-devops-bucket.id

  # Policies And Roles
  default_lambda_role_arn     = aws_iam_role.default-lambda-role.arn
}

module "service-user" {
  source                     = "./modules/service.user"

  # AWS Profile
  aws_access_key              = var.aws_access_key
  aws_secret_key              = var.aws_secret_key
  aws_region                  = var.aws_region
  aws_profile                 = var.aws_profile

  # Storage
  storage_bucket_id           = aws_s3_bucket.storage-bucket.id
  dev_bucket_id               = aws_s3_bucket.storage-devops-bucket.id

  # Database
  db_name                     = mysql_database.application-db.name

  # System Utils
  create_schema_utility       = module.service-system-utils.create_schema_utility

  # Network
  public_subnet_id            = aws_subnet.public-2.id

  # Policies And Roles
  default_lambda_role_arn     = aws_iam_role.default-lambda-role.arn
  
  # API Root
  api_gateway_id              = aws_api_gateway_rest_api.main.id
  root_resource_id            = aws_api_gateway_rest_api.main.root_resource_id
  api_gateway_arn             = aws_api_gateway_rest_api.main.execution_arn
}

module "service-subscriptions" {
  source                     = "./modules/service.subscriptions"

  # AWS Profile
  aws_access_key              = var.aws_access_key
  aws_secret_key              = var.aws_secret_key
  aws_region                  = var.aws_region
  aws_profile                 = var.aws_profile

  # Storage
  storage_bucket_id           = aws_s3_bucket.storage-bucket.id
  dev_bucket_id               = aws_s3_bucket.storage-devops-bucket.id

  # Database
  db_name                     = mysql_database.application-db.name

  # System Utils
  create_schema_utility       = module.service-system-utils.create_schema_utility

  # Network
  public_subnet_id            = aws_subnet.public-2.id

  # Policies And Roles
  default_lambda_role_arn     = aws_iam_role.default-lambda-role.arn
  
  # API Root
  api_gateway_id              = aws_api_gateway_rest_api.main.id
  root_resource_id            = aws_api_gateway_rest_api.main.root_resource_id
  api_gateway_arn             = aws_api_gateway_rest_api.main.execution_arn
}

module "service-worker-gateway" {
  source                      = "./modules/service.worker-gateway"

  # AWS Profile
  aws_access_key              = var.aws_access_key
  aws_secret_key              = var.aws_secret_key
  aws_region                  = var.aws_region
  aws_profile                 = var.aws_profile

  # Storage
  storage_bucket_id           = aws_s3_bucket.storage-bucket.id
  dev_bucket_id               = aws_s3_bucket.storage-devops-bucket.id

  # Network
  public_subnet_id            = aws_subnet.public-2.id

  # Policies And Roles
  default_lambda_role_arn     = aws_iam_role.default-lambda-role.arn
  
  # API Root
  api_gateway_id              = aws_api_gateway_rest_api.main.id
  root_resource_id            = aws_api_gateway_rest_api.main.root_resource_id
  api_gateway_arn             = aws_api_gateway_rest_api.main.execution_arn
}