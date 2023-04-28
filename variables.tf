data "external" "config_json" {
  program = ["cat", "config.json"]
}

locals {
  config = jsondecode(data.external.config_json.result)
}

variable "aws_access_key"         {}
variable "aws_secret_key"         {}
variable "aws_region"             { default = local.config.AWS_REGION }
variable "aws_profile"            { default = local.config.SERVICE_NAME }
variable "service_name"           { default = local.config.SERVICE_NAME }
variable "default_storage_bucket" { default = local.config.SERVICE_NAME }
variable "service_domain"         { default = local.config.SERVICE_DOMAIN }
