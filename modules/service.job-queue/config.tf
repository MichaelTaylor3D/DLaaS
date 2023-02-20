resource "aws_s3_bucket_object" "configurations-job-queue-config-upload" {
  bucket = var.dev_bucket_id
  key    = "configurations/job-queue.config.json"
  content_type = "application/json"
  content = <<EOF
  {  
    "endpoint": "${aws_sqs_queue.job-queue-fifo.id}",
    "arn": "${aws_sqs_queue.job-queue-fifo.arn}",
    "job_folder": "${aws_s3_bucket_object.job-folder.key}"
  }
  EOF
}