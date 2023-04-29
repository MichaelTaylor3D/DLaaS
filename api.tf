# API Gateway REST API definition
resource "aws_api_gateway_rest_api" "main" {
  name        = "datalayer-storage-services-api"
  description = "${local.config.AWS_PROFILE} services API"
}

resource "aws_api_gateway_stage" "production" {
  deployment_id = aws_api_gateway_deployment.production-deployment.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = "prod"
}

resource "aws_api_gateway_deployment" "production-deployment" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  description = "${local.config.AWS_PROFILE}:: API Gateway deployment"

  triggers = {
    redeployment = sha1(timestamp())
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [aws_api_gateway_rest_api.main]
}

resource "aws_api_gateway_usage_plan" "api-usage-plan" {
  name = "${local.config.AWS_PROFILE}-api-usage-plan"

  api_stages {
    api_id = aws_api_gateway_rest_api.main.id
    stage  = aws_api_gateway_stage.production.stage_name
  }
}

resource "aws_api_gateway_api_key" "app-key" {
  name    = "AppKey"
  enabled = true
}

resource "aws_api_gateway_usage_plan_key" "usage-plan-key" {
  key_id        = aws_api_gateway_api_key.app-key.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.api-usage-plan.id
}

resource "aws_api_gateway_domain_name" "api-subdomain" {
  domain_name = "api.${local.config.SERVICE_DOMAIN}"
  certificate_arn = aws_acm_certificate.wildcard-domain.arn
}

resource "aws_api_gateway_base_path_mapping" "archvision-api-base-path-mapping" {
  api_id      = aws_api_gateway_rest_api.main.id
  stage_name  = aws_api_gateway_stage.production.stage_name
  domain_name = aws_api_gateway_domain_name.api-subdomain.domain_name
}

resource "aws_s3_bucket_object" "api-config-upload" {
  bucket       = aws_s3_bucket.storage_devops_bucket.id
  key          = "configurations/api.config.json"
  content_type = "application/json"
  content      = <<EOF
  {  
    "api_key": "${aws_api_gateway_api_key.app-key.value}",
  }
  EOF
}
