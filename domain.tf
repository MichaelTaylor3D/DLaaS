resource "aws_route53_zone" "service-zone" {
  name = var.service_domain
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

resource "aws_route53_record" "cdn-subdomain-a-record" {
  zone_id = aws_route53_zone.service-zone.zone_id
  name    = "cdn.${var.service_domain}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.cdn_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.cdn_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "subdomain-a-record" {
  zone_id = module.service-v1-apps.zone_id
  name    = "fovea.${module.service-v1-apps.domain}"
  type    = "A"
  alias {
    name                   = "d1vt4mui775j5h.cloudfront.net"
    # For CloudFront distributions, the value for zone_id is always Z2FDTNDATAQYW2
    zone_id                = "Z2FDTNDATAQYW2"
    evaluate_target_health = false
  }
}