resource "aws_s3_bucket_object" "subscriptions-config-upload" {
  bucket       = var.dev_bucket_id
  key          = "configurations/subscriptions.config.json"
  content_type = "application/json"
  content      = <<EOF
  { 
    "grace_period_in_days": 15,
  }
  EOF
}