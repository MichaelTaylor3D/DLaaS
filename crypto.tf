resource "random_password" "token_secret" {
  length           = 128
  special          = false
}

resource "aws_s3_bucket_object" "crypto-config-upload" {
  bucket       = aws_s3_bucket.storage-devops-bucket.id
  key          = "configurations/crypto.config.json"
  content_type = "application/json"
  content      = <<EOF
  { 
    "token_secret": "${random_password.token_secret.result}",
    "password_length": 256,
    "iterations": 10000,
    "digest": "sha256",
    "byte_to_string_encoding": "base64",
    "salt_length": 8
  }
  EOF
}