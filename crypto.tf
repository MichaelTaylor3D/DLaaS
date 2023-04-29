/**
 * @fileoverview This Terraform file creates a secure cryptographic configuration, generates random secrets, and
 * uploads the configuration to the 'devops' S3 bucket.
 *
 * The main components of this file include:
 * 1. Random Password Resource (Token Secret): Generates a 128-character random token secret without special characters.
 * 2. Random Password Resource (Static Salt): Generates a 10-character random static salt without special characters.
 * 3. AWS S3 Bucket Object: Uploads the cryptographic configuration to the 'devops' S3 bucket as a JSON file.
 *
 * The cryptographic configuration JSON file contains the following keys:
 * - token_secret: The generated random token secret.
 * - password_length: The fixed length of the password.
 * - iterations: The number of iterations used in the PBKDF2 function.
 * - digest: The hash function used in the PBKDF2 function.
 * - byte_to_string_encoding: The encoding used to convert byte arrays to strings.
 * - dynamic_salt_length: The length of the dynamic salt.
 * - static_salt: The generated random static salt.
 *
 * This configuration is uploaded to the 'devops' S3 bucket with the key 'configurations/crypto.config.json' and
 * content type 'application/json'.
 */

resource "random_password" "token_secret" {
  length           = 128
  special          = false
}

resource "random_password" "static_salt" {
  length           = 10
  special          = false
}

resource "aws_s3_bucket_object" "crypto-config-upload" {
  bucket       = aws_s3_bucket.storage_devops_bucket.id
  key          = "configurations/crypto.config.json"
  content_type = "application/json"
  content      = <<EOF
  { 
    "token_secret": "${random_password.token_secret.result}",
    "password_length": 256,
    "iterations": 10000,
    "digest": "sha256",
    "byte_to_string_encoding": "base64",
    "dynamic_salt_length": 8,
    "static_salt": "${random_password.static_salt.result}"
  }
  EOF
}