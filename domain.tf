resource "aws_route53_zone" "service-zone" {
  name = local.config.SERVICE_DOMAIN
}

resource "aws_route53_record" "www-api-subdomain" {
  zone_id = aws_route53_zone.service-zone.zone_id
  name    = aws_api_gateway_domain_name.api-subdomain.domain_name
  type    = "A"
  alias {
    name                   = aws_api_gateway_domain_name.api-subdomain.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.api-subdomain.cloudfront_zone_id
    evaluate_target_health = false
  }
}