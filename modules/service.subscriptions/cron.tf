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

resource "aws_cloudwatch_event_rule" "cron_check_for_incoming_renewals_function_schedule" {
  name                = "cron-check-for-incoming-renewals-schedule"
  description         = "${var.aws_profile}: Fires cron check for incoming renewals function every 24 hours"
  schedule_expression = "rate(24 hours)"
}

resource "aws_cloudwatch_event_target" "cron_check_for_incoming_renewals_function_event" {
  rule      = aws_cloudwatch_event_rule.cron_check_for_incoming_renewals_function_schedule.name
  target_id = "lambda"
  arn       = aws_lambda_function.cron_check_for_incoming_renewals_function_handler.arn
  input     = "{\"body\": \"0\"}"
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_cron_check_for_incoming_renewals_function_event" {
  statement_id  = "AllowExecutionFromCloudWatchForCronCheckForIncomingRenewals"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cron_check_for_incoming_renewals_function_handler.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cron_check_for_incoming_renewals_function_schedule.arn
}

resource "aws_cloudwatch_event_rule" "cron_cleanup_expired_subscriptions_function_schedule" {
  name                = "cron-cleanup-expired-subscriptions-schedule"
  description         = "${var.aws_profile}: Fires cron cleanup expired subscriptions function every 24 hours"
  schedule_expression = "rate(24 hours)"
}

resource "aws_cloudwatch_event_target" "cron_cleanup_expired_subscriptions_function_event" {
  rule      = aws_cloudwatch_event_rule.cron_cleanup_expired_subscriptions_function_schedule.name
  target_id = "lambda"
  arn       = aws_lambda_function.cron_cleanup_expired_subscriptions_function_handler.arn
  input     = "{\"body\": \"0\"}"
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_cron_cleanup_expired_subscriptions_function_event" {
  statement_id  = "AllowExecutionFromCloudWatchForCronCleanupExpiredSubscriptions"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cron_cleanup_expired_subscriptions_function_handler.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cron_cleanup_expired_subscriptions_function_schedule.arn
}

resource "aws_cloudwatch_event_rule" "cron_set_subscriptions_to_expired_function_schedule" {
  name                = "cron-set-subscriptions-to-expired-schedule"
  description         = "${var.aws_profile}: Fires cron set subscriptions to expired function every 24 hours"
  schedule_expression = "rate(24 hours)"
}

resource "aws_cloudwatch_event_target" "cron_set_subscriptions_to_expired_function_event" {
  rule      = aws_cloudwatch_event_rule.cron_set_subscriptions_to_expired_function_schedule.name
  target_id = "lambda"
  arn       = aws_lambda_function.cron_set_subscriptions_to_expired_function_handler.arn
  input     = "{\"body\": \"0\"}"
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_cron_set_subscriptions_to_expired_function_event" {
  statement_id  = "AllowExecutionFromCloudWatchForCronSetSubscriptionsToExpired"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cron_set_subscriptions_to_expired_function_handler.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cron_set_subscriptions_to_expired_function_schedule.arn
}
