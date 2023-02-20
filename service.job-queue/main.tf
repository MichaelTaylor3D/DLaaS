provider "aws" {
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  region     = var.aws_region
  profile    = var.aws_profile
}

resource "aws_s3_bucket_object" "job_status_enum_upload" {
  bucket = var.dev_bucket_id
  key    = "configurations/job_status.enum.json"
  content_type = "application/json"
  content = <<EOF
  {  
    "WAITING_FOR_FILE": "WAITING_FOR_FILE",
    "QUEUED": "QUEUED",
    "PROCESSING": "PROCESSING",
    "COMPLETED": "COMPLETED",
    "TRASHED": "TRASHED",
    "FAILED": "FAILED" 
  }
  EOF
}

resource "aws_s3_bucket_object" "jobs_config_upload" {
  bucket       = var.dev_bucket_id
  content_type = "application/json"
  key          = "configurations/jobs.config.json"
  source       = "${path.module}/jobs.config.json"
  etag         = filemd5("${path.module}/jobs.config.json")
}