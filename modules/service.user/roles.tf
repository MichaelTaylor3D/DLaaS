/**
 * @fileoverview This Terraform configuration file manages the creation of an AWS IAM role
 * called 'custom_authorizer_role' for a Lambda function. The role has an assume_role_policy
 * that allows the Lambda service to assume the role, granting the necessary permissions
 * for the Lambda function to execute successfully.
 */

resource "aws_iam_role" "custom_authorizer_role" {
  name = "custom_authorizer_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}
