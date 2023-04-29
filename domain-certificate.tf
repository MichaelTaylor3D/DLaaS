/**
 * @fileoverview This Terraform configuration file manages the creation and validation
 * of two AWS ACM certificates for the primary domain and wildcard subdomains.
 * The primary domain certificate is created for the Route53 hosted zone and uses
 * DNS validation. The wildcard domain certificate covers all subdomains of the
 * primary domain. Both certificates are tagged with the environment and have the
 * lifecycle policy to create before destroy. The Route53 DNS records are created
 * for certificate validation, and the certificate validation resources manage the
 * validation process for both primary and wildcard domain certificates.
 *
 * @note During deployment, you need to change the nameservers of your domain
 * registrar to point to the Route53 hosted zone's nameservers in order for
 * the certificate validation process to complete successfully.
 */
 
 resource "aws_acm_certificate" "primary-domain" {
   domain_name       = aws_route53_zone.service-zone.name
   validation_method = "DNS"

   tags = {
     Environment = "Prod"
   }

   lifecycle {
     create_before_destroy = true
   }
 }

 resource "aws_route53_record" "cert_validation" {
   for_each = {
     for dvo in aws_acm_certificate.primary-domain.domain_validation_options : dvo.domain_name => {
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
   zone_id = aws_route53_zone.service-zone.id
 }

 resource "aws_acm_certificate_validation" "primary-domain-certificate" {
   certificate_arn         = aws_acm_certificate.primary-domain.arn
   validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
 }

resource "aws_acm_certificate" "wildcard-domain" {
  domain_name       = "*.${aws_route53_zone.service-zone.name}"
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
