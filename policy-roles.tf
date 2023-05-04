/**
 * @fileoverview This Terraform file creates an AWS IAM role and policy to be used by Lambda functions and API Gateway. 
 * The IAM role has permissions to access various AWS services and resources.
 *
 * The main components of this file include:
 * 1. AWS IAM Role: Creates a default IAM role for Lambda functions and API Gateway.
 * 2. AWS IAM Role Policy: Defines a policy with the necessary permissions for the IAM role.
 * 3. Output: Exports the ARN of the created IAM role.
 *
 * The policy provides permissions for the following services and resources:
 * - Lambda: Invocation of Lambda functions.
 * - CloudWatch Logs: Creating log streams, log deliveries, and putting log events.
 * - Amazon SES: Sending emails.
 * - Amazon SQS: Sending and receiving messages, managing message visibility, getting queue URLs, and deleting messages.
 * - Amazon S3: Getting, tagging, listing, deleting, and putting objects.
 */

resource "aws_iam_role" "default-lambda-role" {
    name               = "default-lambda-role"
    description        = "${local.config.AWS_PROFILE}: IAM Role for the Lambdas."
    assume_role_policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [{
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com",
          "apigateway.amazonaws.com"
        ]
      },
      "Effect": "Allow",
      "Sid": ""
    }]
  })
}

# Create an IAM policy for a role
resource "aws_iam_role_policy" "default-lambda-policy" {
  name = "AWSLambdaBasicExecutionRole"

  # ID of lambda role from above
  role   = aws_iam_role.default-lambda-role.id
  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": ["lambda:InvokeFunction"],
        "Resource": "arn:aws:lambda:*:*:*"
      },
      {
        "Action": [
          "logs:CreateLogStream",
          "logs:CreateLogDelivery",
          "logs:PutLogEvents"
        ],
        "Effect": "Allow",
        "Resource": "*"
      },
      {
        "Effect": "Allow",
        "Action": "ses:SendEmail",
        "Resource": "*"
      },
      {
        "Effect": "Allow",
        "Action": "sqs:SendMessage",
        "Resource": "*"
      },
      {
        "Action": [
          "sqs:ReceiveMessage",
          "sqs:ChangeMessageVisibility",
          "sqs:GetQueueUrl",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ],
        "Resource": "*",
        "Effect": "Allow"
      },
      {
        "Action": [
          "s3:GetObject",
          "s3:GetObjectTagging",
          "s3:ListBucket",
          "s3:DeleteObject",
          "s3:PutObject",
          "s3:PutObjectTagging"
        ],
        "Effect": "Allow",
        "Resource": "*"
      },
      {
        "Effect": "Allow",
        "Action": [
          "execute-api:Invoke",
          "execute-api:ManageConnections"
        ],
        "Resource": "arn:aws:execute-api:*:*:*/*/*/*"
      }
    ]
  })
}


output "default_lambda_role_arn" { value = aws_iam_role.default-lambda-role.arn }