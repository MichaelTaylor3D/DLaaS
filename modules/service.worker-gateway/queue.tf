resource "aws_sqs_queue" "fifo_queue" {
  fifo_queue                        = true
  name                              = "worker-gateway-message-handler.fifo"
  sqs_managed_sse_enabled           = true
}

resource "aws_s3_bucket_object" "command-queue-config-upload" {
  bucket       = var.dev_bucket_id
  key          = "configurations/command-queue.config.json"
  content_type = "application/json"
  content      = <<EOF
  {  
    "queue_url": "${aws_sqs_queue.fifo_queue.url}"
  }
  EOF
}