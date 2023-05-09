resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = var.service_bucket_id

  lambda_function {
    lambda_function_arn = aws_lambda_function.invalidate_cdn_function_handler.arn
    events              = ["s3:ObjectCreated:*"]
  }
}

resource "aws_lambda_permission" "allow_bucket" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.invalidate_cdn_function_handler.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = "${var.service_bucket_arn}"
}