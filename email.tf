/**
 * @fileoverview This Terraform file sets up AWS Simple Email Service (SES) domain identity and related resources for
 * the service domain. It includes the configuration of the SES domain identity, mail from domain, Route53 records for
 * domain verification, DKIM, SPF, and mail from.
 *
 * The main components of this file include:
 * 1. AWS SES Domain Identity: Creates an SES domain identity for the specified service domain.
 * 2. AWS SES Domain Mail From: Configures the mail from domain for the SES domain identity.
 * 3. AWS Route53 TXT Record: Sets up the Amazon SES domain verification record in Route53.
 * 4. AWS SES Domain DKIM: Generates DKIM tokens for the SES domain identity.
 * 5. AWS Route53 CNAME Records: Configures the Route53 records for the SES domain DKIM tokens.
 * 6. AWS Route53 TXT Records: Sets up SPF records for the mail from domain and the service domain in Route53.
 */


resource "aws_ses_domain_identity" "ses_domain" {
  domain = local.config.SERVICE_DOMAIN
}

resource "aws_ses_domain_mail_from" "main" {
  domain           = aws_ses_domain_identity.ses_domain.domain
  mail_from_domain = "mail.${local.config.SERVICE_DOMAIN}"
}

resource "aws_route53_record" "amazonses_verification_record" {
  zone_id = aws_route53_zone.service-zone.zone_id
  name    = "_amazonses.${local.config.SERVICE_DOMAIN}"
  type    = "TXT"
  ttl     = "600"
  records = [join("", aws_ses_domain_identity.ses_domain.*.verification_token)]
}

resource "aws_ses_domain_dkim" "ses_domain_dkim" {
  domain = join("", aws_ses_domain_identity.ses_domain.*.domain)
}

resource "aws_route53_record" "amazonses_dkim_record" {
  count   = 3
  zone_id = aws_route53_zone.service-zone.zone_id 
  name    = "${element(aws_ses_domain_dkim.ses_domain_dkim.dkim_tokens, count.index)}._domainkey.${local.config.SERVICE_DOMAIN}"
  type    = "CNAME"
  ttl     = "600"
  records = ["${element(aws_ses_domain_dkim.ses_domain_dkim.dkim_tokens, count.index)}.dkim.amazonses.com"]
}

resource "aws_route53_record" "spf_mail_from" {
  zone_id = aws_route53_zone.service-zone.zone_id 
  name    = aws_ses_domain_mail_from.main.mail_from_domain
  type    = "TXT"
  ttl     = "600"
  records = ["v=spf1 include:amazonses.com -all"]
}

resource "aws_route53_record" "spf_domain" {
  zone_id = aws_route53_zone.service-zone.zone_id   
  name    = local.config.SERVICE_DOMAIN
  type    = "TXT"
  ttl     = "600"
  records = ["v=spf1 include:amazonses.com -all"]
}