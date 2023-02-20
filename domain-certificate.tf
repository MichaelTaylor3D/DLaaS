# resource "aws_acm_certificate" "primary-domain" {
#   domain_name       = var.service_domain
#   validation_method = "DNS"

#   tags = {
#     Environment = "Prod"
#   }

#   lifecycle {
#     create_before_destroy = true
#   }
# }

# resource "aws_route53_record" "cert_validation" {
#   for_each = {
#     for dvo in aws_acm_certificate.primary-domain.domain_validation_options : dvo.domain_name => {
#       name   = dvo.resource_record_name
#       record = dvo.resource_record_value
#       type   = dvo.resource_record_type
#     }
#   }

#   allow_overwrite = true
#   name            = each.value.name
#   records         = [each.value.record]
#   ttl             = 60
#   type            = each.value.type
#   zone_id = aws_route53_zone.service-zone.id
# }

# resource "aws_acm_certificate_validation" "primary-domain-certificate" {
#   certificate_arn         = aws_acm_certificate.primary-domain.arn
#   validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
# }

resource "aws_acm_certificate" "wildcard-domain" {
  domain_name       = "*.${var.service_domain}"
  validation_method = "DNS"

  tags = {
    Environment = "Prod"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "wildcard-cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.wildcard-domain.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.service-zone.id
}

resource "aws_acm_certificate_validation" "wildcard-domain-certificate" {
  certificate_arn         = aws_acm_certificate.wildcard-domain.arn
  validation_record_fqdns = [for record in aws_route53_record.wildcard-cert_validation : record.fqdn]
}
