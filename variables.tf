data "external" "config_json" {
  program = ["cat", "config.json"]
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

variable "aws_access_key"         {}
variable "aws_secret_key"         {}
variable "aws_account_id"         {}