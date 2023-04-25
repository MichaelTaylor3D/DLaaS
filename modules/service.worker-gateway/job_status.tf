resource "aws_s3_bucket_object" "job-status-config-upload" {
  bucket       = var.dev_bucket_id
  key          = "configurations/job_status.config.json"
  content_type = "application/json"
  content      = <<EOF
  { 
    "SUBMITTED": "SUBMITTED",
    "PENDING": "PENDING",
    "FAILED": "FAILED",
    "SUCCESS": "SUCCESS"
  }
  EOF
}