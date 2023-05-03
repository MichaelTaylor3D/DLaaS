data "aws_caller_identity" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id
}

resource "aws_apigatewayv2_api" "worker_gateway_ws_api" {
  name                         = "worker-gateway-ws-api"
  description                  = "Send websocket data to SQS which is then processed by the worker"
  protocol_type                = "WEBSOCKET"
  route_selection_expression   = "$request.body.action"
}

resource "aws_apigatewayv2_integration" "websocket_integration" {
    api_id                                    = aws_apigatewayv2_api.worker_gateway_ws_api.id
    connection_type                           = "INTERNET"
    credentials_arn                           = var.default_lambda_role_arn
    integration_method                        = "POST"
    integration_type                          = "AWS"
    integration_uri                           = "arn:aws:apigateway:${var.aws_region}:sqs:path/${local.account_id}/${aws_sqs_queue.fifo_queue.name}"
    passthrough_behavior                      = "NEVER"
    request_parameters                        = {
        "integration.request.header.Content-Type" = "'application/x-www-form-urlencoded'"
    }
    request_templates                         = {
        "$default" = "Action=SendMessage&MessageGroupId=$input.path('$.MessageGroupId')&MessageDeduplicationId=$context.requestId&MessageAttribute.1.Name=connectionId&MessageAttribute.1.Value.StringValue=$context.connectionId&MessageAttribute.1.Value.DataType=String&MessageAttribute.2.Name=requestId&MessageAttribute.2.Value.StringValue=$context.requestId&MessageAttribute.2.Value.DataType=String&MessageBody=$input.json('$')"
    }
    template_selection_expression             = "\\$default"
    timeout_milliseconds                      = 29000
}

resource "aws_apigatewayv2_stage" "production" {
  api_id          = aws_apigatewayv2_api.worker_gateway_ws_api.id
  name            = "production"
  auto_deploy     = true
}

resource "aws_apigatewayv2_route" "default" {
    api_id               = aws_apigatewayv2_api.worker_gateway_ws_api.id
    route_key            = "$default"
    target               = "integrations/${aws_apigatewayv2_integration.websocket_integration.id}"  
}

resource "aws_s3_bucket_object" "websocket-api-config-upload" {
  bucket       = var.dev_bucket_id
  key          = "configurations/websocket.config.json"
  content_type = "application/json"
  content      = <<EOF
  {  
    "postback_url": "https://${aws_apigatewayv2_api.worker_gateway_ws_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_apigatewayv2_stage.production.name}",
    "websocket_url": "${aws_apigatewayv2_api.worker_gateway_ws_api.api_endpoint}/${aws_apigatewayv2_stage.production.name}",
    "aws_region": "${var.aws_region}"
  }
  EOF
}
