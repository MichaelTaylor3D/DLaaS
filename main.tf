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
  region     = local.config.AWS_REGION 
}

module "service-system-utils" {
  source                     = "./modules/service.system-utils"

  # AWS Profile
  aws_access_key              = var.aws_access_key
  aws_secret_key              = var.aws_secret_key
  aws_region                  = local.config.AWS_REGION 
  aws_profile                 = local.config.AWS_PROFILE

  # Storage
  dev_bucket_id               = aws_s3_bucket.storage_devops_bucket.id

  # Policies And Roles
  default_lambda_role_arn     = aws_iam_role.default-lambda-role.arn
}

module "service-user" {
  source                     = "./modules/service.user"

  providers = {
    aws = aws
  }

  # AWS Profile
  aws_access_key              = var.aws_access_key
  aws_secret_key              = var.aws_secret_key
  aws_region                  = local.config.AWS_REGION 
  aws_profile                 = local.config.AWS_PROFILE

  # Storage
  storage_bucket_id           = aws_s3_bucket.storage-bucket.id
  dev_bucket_id               = aws_s3_bucket.storage_devops_bucket.id

  # Database
  db_name                     = local.config.SERVICE_NAME

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

  # APP Root
  app_gateway_id              = aws_api_gateway_rest_api.www.id
  app_root_resource_id        = aws_api_gateway_rest_api.www.root_resource_id
  app_gateway_arn             = aws_api_gateway_rest_api.www.execution_arn

  depends_on = [
    aws_db_instance.default,
    aws_lambda_invocation.init-db
  ]
}

/*
module "service-subscriptions" {
  source                     = "./modules/service.subscriptions"

  providers = {
    aws = aws
  }

  # AWS Profile
  aws_access_key              = var.aws_access_key
  aws_secret_key              = var.aws_secret_key
  aws_region                  = local.config.AWS_REGION 
  aws_profile                 = local.config.AWS_PROFILE

  # Storage
  storage_bucket_id           = aws_s3_bucket.storage-bucket.id
  dev_bucket_id               = aws_s3_bucket.storage_devops_bucket.id

  # Database
  db_name                     = local.config.SERVICE_NAME

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

  # APP Root
  app_gateway_id              = aws_api_gateway_rest_api.www.id
  app_root_resource_id        = aws_api_gateway_rest_api.www.root_resource_id
  app_gateway_arn             = aws_api_gateway_rest_api.www.execution_arn

  depends_on = [
    module.service-user,
    aws_db_instance.default,
    aws_lambda_invocation.init-db
  ]
}
*/

module "service-worker-gateway" {
  source                      = "./modules/service.worker-gateway"

  # AWS Profile
  aws_access_key              = var.aws_access_key
  aws_secret_key              = var.aws_secret_key
  aws_region                  = local.config.AWS_REGION 
  aws_profile                 = local.config.AWS_PROFILE

  # Storage
  storage_bucket_id           = aws_s3_bucket.storage-bucket.id
  dev_bucket_id               = aws_s3_bucket.storage_devops_bucket.id

  # Network
  public_subnet_id            = aws_subnet.public-2.id

  # Policies And Roles
  default_lambda_role_arn     = aws_iam_role.default-lambda-role.arn
  
  # API Root
  api_gateway_id              = aws_api_gateway_rest_api.main.id
  root_resource_id            = aws_api_gateway_rest_api.main.root_resource_id
  api_gateway_arn             = aws_api_gateway_rest_api.main.execution_arn
}