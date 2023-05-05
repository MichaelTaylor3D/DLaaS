resource "aws_cloudwatch_event_rule" "cron_check_for_payment_function_schedule" {
  name                = "cron-check-for-payment-schedule"
  description         = "${var.aws_profile}: Fires cron check for payment function every 30 minutes"
  schedule_expression = "rate(24 hours)"
}

resource "aws_cloudwatch_event_target" "cron_check_for_payment_function_event" {
  rule      = aws_cloudwatch_event_rule.cron_check_for_payment_function_schedule.name
  target_id = "lambda"
  arn       = aws_lambda_function.cron_check_for_payment_function_handler.arn
  input     = "{\"body\": \"0\"}"
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_cron_check_for_payment_function_event" {
  statement_id  = "AllowExecutionFromCloudWatchForCronCheckForPayment"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cron_check_for_payment_function_handler.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cron_check_for_payment_function_schedule.arn
}

resource "aws_cloudwatch_event_rule" "cron_clean_up_unfulfilled_subscriptions_handler_schedule" {
  name                = "cron-clean-up-unfulfilled-subscriptions-schedule"
  description         = "${var.aws_profile}: Fires cron clean up unfulfilled subscriptions function every 24 hours"
  schedule_expression = "rate(24 hours)"
}

resource "aws_cloudwatch_event_target" "cron_clean_up_unfulfilled_subscriptions_handler_event" {
  rule      = aws_cloudwatch_event_rule.cron_clean_up_unfulfilled_subscriptions_handler_schedule.name
  target_id = "lambda"
  arn       = aws_lambda_function.cron_clean_up_unfulfilled_subscriptions_function_handler.arn
  input     = "{\"body\": \"0\"}"
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_cron_clean_up_unfulfilled_subscriptions_handler_event" {
  statement_id  = "AllowExecutionFromCloudWatchForCronCleanUpUnfulfilledSubscriptions"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cron_clean_up_unfulfilled_subscriptions_function_handler.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cron_clean_up_unfulfilled_subscriptions_handler_schedule.arn
}
