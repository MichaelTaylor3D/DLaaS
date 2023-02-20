resource "aws_sqs_queue" "job-queue-fifo" {
  name                        = "job-queue.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
  visibility_timeout_seconds  = 30
  message_retention_seconds   = 345600
  delay_seconds               = 0
  max_message_size            = 262144
  receive_wait_time_seconds   = 0

  policy = jsonencode({
    "Version": "2008-10-17",
    "Id": "__default_policy_ID",
    "Statement": [
      {
        "Sid": "__owner_statement",
        "Effect": "Allow",
        "Principal": {
          "AWS": "967172210420"
        },
        "Action": [
          "SQS:*"
        ],
        "Resource": "arn:aws:sqs:us-east-1:967172210420:"
      }
    ]
  })

  tags = {
    Name = "${var.aws_profile}: SQS Queue"
    Environment = "Dev"
  }
}
