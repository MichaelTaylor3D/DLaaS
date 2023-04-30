data "external" "config_json" {
  program = ["cat", "./utils/config.json"]
}

locals {
  config = jsondecode(jsonencode(data.external.config_json.result))
}

# Save the config.json file to the S3 bucket
resource "aws_s3_bucket_object" "app-config-upload" {
  bucket       = aws_s3_bucket.storage_devops_bucket.id
  key          = "configurations/app.config.json"
  content_type = "application/json"
  content      = jsonencode(data.external.config_json.result)
}

# Add these variables to your tfvars file or the variables tab in Terraform Cloud Workspace
variable "aws_access_key"         {}
variable "aws_secret_key"         {}