resource "aws_cloudwatch_event_rule" "cron_add_missing_files_function_schedule" {
  name                = "cron-add-missing-files-schedule"
  description         = "${var.aws_profile}: Fires cron add missing files function every 24 hours"
  schedule_expression = "rate(24 hours)"
}

resource "aws_cloudwatch_event_target" "cron_add_missing_files_function_event" {
  rule      = aws_cloudwatch_event_rule.cron_add_missing_files_function_schedule.name
  target_id = "lambda"
  arn       = aws_lambda_function.cron_add_missing_files_function_handler.arn
  input     = "{\"body\": \"0\"}"
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_cron_add_missing_files_function_event" {
  statement_id  = "AllowExecutionFromCloudWatchForCronAddMissingFiles"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cron_add_missing_files_function_handler.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cron_add_missing_files_function_schedule.arn
}
