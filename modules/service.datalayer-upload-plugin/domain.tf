resource "aws_route53_record" "plugin-subdomain" {
  zone_id = var.domain_zone_id
  name    = aws_api_gateway_domain_name.plugin_subdomain.domain_name
  type    = "A"
  alias {
    name                   = aws_api_gateway_domain_name.plugin_subdomain.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.plugin_subdomain.cloudfront_zone_id
    evaluate_target_health = false
  }
}