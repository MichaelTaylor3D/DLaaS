resource "aws_iam_role" "default-lambda-role" {
    name               = "default-lambda-role"
    description        = "${var.aws_profile}: IAM Role for the Lambdas."
    assume_role_policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [{
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com",
          "apigateway.amazonaws.com",
					"autoscaling.amazonaws.com"
        ]
      },
      "Effect": "Allow",
      "Sid": ""
    }]
  })
}

# Create an IAM policy for a role
resource "aws_iam_role_policy" "default-lambda-policy" {
    name   = "AWSLambdaBasicExecutionRole"

    # ID of lambda role from above
    role   = aws_iam_role.default-lambda-role.id
    policy = jsonencode({
    	"Version": "2012-10-17",
    	"Statement": [{
    			"Effect": "Allow",
    			"Action": ["lambda:InvokeFunction"],
    			"Resource": "arn:aws:lambda:*:*:*"
    		}, {
					"Action": [
						"logs:CreateLogStream",
						"logs:CreateLogDelivery",
						"logs:PutLogEvents"
					],
					"Effect": "Allow",
					"Resource": "*"
				}, {
					"Effect": "Allow",
					"Action": [
						"ecr:DescribeImages",
						"ecr:DescribeRepositories"
					],
					"Resource": "*"
				}, {
					"Effect": "Allow",
					"Action": [
						"ec2:DescribeNetworkInterfaces",
						"ec2:CreateNetworkInterface",
						"ec2:DeleteNetworkInterface",
						"ec2:DescribeInstances",
						"ec2:AttachNetworkInterface"
					],
					"Resource": "*"
				}, {
    			"Effect": "Allow",
    			"Action": "ses:SendEmail",
    			"Resource": "*"
    		}, {
    			"Effect": "Allow",
    			"Action": "sqs:SendMessage",
    			"Resource": "*"
    		}, {
				  "Effect": "Allow",
    			"Action": [
						"autoscaling:StartInstanceRefresh",
						"autoscaling:ExecutePolicy"
					],
    			"Resource": "*"
				}, {
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
    		}
    	]
    })
}

output "default_lambda_role_arn" { value = aws_iam_role.default-lambda-role.arn }