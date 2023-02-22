resource "aws_sqs_queue" "fifo_queue" {
  fifo_queue                        = true
  name                              = "worker_gateway_message_handler"
  sqs_managed_sse_enabled           = true
}