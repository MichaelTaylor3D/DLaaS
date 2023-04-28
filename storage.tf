resource "aws_s3_bucket" "storage_devops_bucket" {
  # Bucket name must be unique across all AWS users!
  bucket = "${local.config.DEFAULT_STORAGE_BUCKET}.dev"

  tags = {
    Name        = "${local.config.AWS_PROFILE} Configuration Bucket"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket" "storage_bucket" {
  # Bucket name must be unique across all AWS users!
  bucket              = local.config.DEFAULT_STORAGE_BUCKET
  acceleration_status = "Enabled"
  policy              = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "DistinctPublicFolder",
        "Effect": "Allow",
        "Principal": {
          "AWS": "*"
        },
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::${local.config.DEFAULT_STORAGE_BUCKET}/public/*"
      }
    ]
  })
  
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

  tags = {
    Name        = "${local.config.AWS_PROFILE} Storage Bucket"
    Environment = "Prod"
  }
}

resource "aws_s3_bucket_object" "public-folder" {
    bucket = aws_s3_bucket.storage_bucket.id
    acl    = "public-read"
    key    = "public/"
    source = "/dev/null"
}#