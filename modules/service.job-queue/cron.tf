resource "aws_cloudwatch_event_rule" "periodic_instance_refresh_schedule" {
  name                = "periodic-instance-refresh-schedule"
  description         = "${var.aws_profile}: Refreshes the running instances every 3 hours"
  schedule_expression = "rate(3 hours)"
}

resource "aws_cloudwatch_event_target" "periodic_instance_refresh_event" {
  rule      = aws_cloudwatch_event_rule.periodic_instance_refresh_schedule.name
  target_id = "lambda"
  arn       = aws_lambda_function.start-instance-refresh-function-handler.arn
  input     = "{\"body\": \"0\"}"
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_periodic_instance_refresh_event" {
  statement_id  = "AllowExecutionFromCloudWatchForAlignLambdaKeepAwake"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.start-instance-refresh-function-handler.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.periodic_instance_refresh_schedule.arn
}