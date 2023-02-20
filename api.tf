# API Gateway REST API definition
resource "aws_api_gateway_rest_api" "main" {
  name        = "datalayer-services-api"
  description = "${var.aws_profile} services API [Deployed: ${timestamp()}]"
}
