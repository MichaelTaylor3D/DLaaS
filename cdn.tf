resource "aws_cloudfront_distribution" "cdn_distribution" {
  origin {
    domain_name = aws_s3_bucket.storage-bucket.bucket_regional_domain_name
    origin_id   = local.config.DEFAULT_S3_BUCKET

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.static_site_identity.cloudfront_access_identity_path
    }

    custom_origin_config {
      http_port = 80
      https_port = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols = ["TLSv1.2"]
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["cdn.${local.config.SERVICE_DOMAIN}"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.config.DEFAULT_S3_BUCKET

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.wildcard-domain.arn
    ssl_support_method = "sni-only"
  }
}

# Create an origin access identity for the CloudFront distribution
resource "aws_cloudfront_origin_access_identity" "static_site_identity" {}

# Grant access to the S3 bucket for the origin access identity
resource "aws_s3_bucket_policy" "static_site_bucket_policy" {
  bucket = aws_s3_bucket.storage-bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "s3:GetObject"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.static_site_identity.iam_arn
        }
        Resource = "${aws_s3_bucket.static_site_bucket.arn}/*"
      },
    ]
  })
}

resource "aws_s3_bucket_object" "configurations-cdn-config-file-upload" {
  bucket       = aws_s3_bucket.storage_devops_bucket.id
  key          = "configurations/cdn.config.json"
  content_type = "application/json"
  content      = <<EOF
  {  
    "public": "${aws_route53_record.cdn-subdomain-a-record.name}/public",
    "id": "${aws_cloudfront_distribution.cdn_distribution.id}"
  }
  EOF
}