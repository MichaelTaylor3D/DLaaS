/**
 * @fileoverview This Terraform configuration file manages the creation of an AWS Route53
 * hosted zone and a corresponding Route53 record for the API Gateway subdomain. The hosted
 * zone is created using the SERVICE_DOMAIN from the local configuration. The Route53 record
 * is an "A" type record for the API Gateway subdomain, pointing to the CloudFront distribution
 * associated with the API Gateway using an alias.
 */

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

resource "aws_route53_record" "www-app-subdomain" {
  zone_id = aws_route53_zone.service-zone.zone_id
  name    = aws_api_gateway_domain_name.app-subdomain.domain_name
  type    = "A"
  alias {
    name                   = aws_api_gateway_domain_name.app-subdomain.cloudfront_domain_name
    zone_id                = aws_api_gateway_domain_name.app-subdomain.cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "cdn-subdomain-a-record" {
  zone_id = aws_route53_zone.service-zone.zone_id
  name    = "cdn.${local.config.SERVICE_DOMAIN}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.cdn_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.cdn_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}