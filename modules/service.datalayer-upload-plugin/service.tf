# API Gateway REST API definition
resource "aws_api_gateway_rest_api" "plugin_service" {
  name        = "datalayer-upload-plugin-api"
  description = "${var.aws_profile} Upload plugin for datalayer"
}

resource "aws_api_gateway_stage" "production_plugin" {
  deployment_id = aws_api_gateway_deployment.production_plugin_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.plugin_service.id
  stage_name    = "prod"
}

resource "aws_api_gateway_deployment" "production_plugin_deployment" {
  rest_api_id = aws_api_gateway_rest_api.plugin_service.id
  description = "${var.aws_profile}:: API Gateway deployment plugin"

  triggers = {
    redeployment = sha1(timestamp())
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [aws_api_gateway_rest_api.plugin_service]
}

resource "aws_api_gateway_usage_plan" "plugin_service_usage_plan" {
  name = "${var.aws_profile}-plugin-service-usage-plan"

  api_stages {
    api_id = aws_api_gateway_rest_api.plugin_service.id
    stage  = aws_api_gateway_stage.production_plugin.stage_name
  }
}

resource "aws_api_gateway_domain_name" "plugin_subdomain" {
  domain_name = "plugin.${var.service_domain}"
  certificate_arn = var.wildcard_certificate_arn
}

resource "aws_api_gateway_base_path_mapping" "plugin_base_path_mapping" {
  api_id      = aws_api_gateway_rest_api.plugin_service.id
  stage_name  = aws_api_gateway_stage.production_plugin.stage_name
  domain_name = aws_api_gateway_domain_name.plugin_subdomain.domain_name
}
