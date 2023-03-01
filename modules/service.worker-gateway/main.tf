provider "aws" {
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  region     = var.aws_region
}

resource "aws_s3_bucket_object" "job_command_enum_upload" {
  bucket = var.dev_bucket_id
  key    = "configurations/commands.enum.json"
  content_type = "application/json"
  content = <<EOF
  {  
    "CREATE_MIRROR": "CREATE_MIRROR",
  }
  EOF
}