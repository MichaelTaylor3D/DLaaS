/* @fileoverview This Terraform configuration file sets up an AWS API Gateway REST API
 * for the app subdomain. The app subdomain is intended for GET requests that are 
 * meant to be viewed in the browser, as opposed to an API for data manipulation.
 */

# API Gateway REST API definition
resource "aws_api_gateway_rest_api" "www" {
  name        = "datalayer-storage-services-api"
  description = "${local.config.AWS_PROFILE} services API"
}

resource "aws_api_gateway_stage" "production_www" {
  deployment_id = aws_api_gateway_deployment.production_www_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.www.id
  stage_name    = "prod"
}

resource "aws_api_gateway_deployment" "production_www_deployment" {
  rest_api_id = aws_api_gateway_rest_api.www.id
  description = "${local.config.AWS_PROFILE}:: API Gateway deployment"

  triggers = {
    redeployment = sha1(timestamp())
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [aws_api_gateway_rest_api.www]
}

resource "aws_api_gateway_usage_plan" "www-usage-plan" {
  name = "${local.config.AWS_PROFILE}-www-usage-plan"

  api_stages {
    api_id = aws_api_gateway_rest_api.www.id
    stage  = aws_api_gateway_stage.production_www.stage_name
  }
}

resource "aws_api_gateway_domain_name" "app-subdomain" {
  domain_name = "app.${local.config.SERVICE_DOMAIN}"
  certificate_arn = aws_acm_certificate.wildcard-domain.arn
}

resource "aws_api_gateway_base_path_mapping" "app-base-path-mapping" {
  api_id      = aws_api_gateway_rest_api.www.id
  stage_name  = aws_api_gateway_stage.production_www.stage_name
  domain_name = aws_api_gateway_domain_name.app-subdomain.domain_name
}