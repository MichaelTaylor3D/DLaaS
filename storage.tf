/**
 * @fileoverview This Terraform file creates two Amazon S3 buckets: a private 'devops' bucket for storing
 * programmatic configurations describing various infrastructure parameters, and a production bucket with a public folder.
 *
 * The main components of this file include:
 * 1. AWS S3 Bucket (DevOps): Creates a private 'devops' bucket to store programmatic configurations accessible
 *    by both Lambda execution environments and worker scripts.
 * 2. AWS S3 Bucket (Production): Creates a production storage bucket with acceleration status enabled, a public folder,
 *    and a CORS configuration.
 * 3. AWS S3 Bucket Object: Creates a 'public/' folder in the production storage bucket and sets its ACL to 'public-read'.
 *
 * Both buckets are tagged with the AWS_PROFILE and the respective environment (Dev or Prod).
 *
 * The 'devops' bucket is private and reserved for storing programmatic configurations that describe different
 * parameters of the infrastructure so that it's accessible by both Lambda execution environments and worker scripts.
 *
 * The production storage bucket has the following configurations:
 * - Bucket Policy: Allows public read access to the 'public/' folder.
 * - CORS Rule: Configures CORS for the bucket, allowing all origins and headers, and exposing the ETag header.
 */


resource "aws_s3_bucket" "storage_devops_bucket" {
  bucket = "${local.config.DEFAULT_S3_BUCKET}.devops"
  force_destroy = true

  tags = {
    Name        = "${local.config.AWS_PROFILE} Configuration Bucket"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket" "storage-bucket" {
  bucket              = local.config.DEFAULT_S3_BUCKET
  force_destroy       = true
  acceleration_status = "Enabled"
  acl                 = "public-read"

  policy              = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": {
          "AWS": "*"
        },
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::${local.config.DEFAULT_S3_BUCKET}/*"
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

  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}

resource "aws_s3_bucket_public_access_block" "access_block" {
  bucket = aws_s3_bucket.storage-bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
