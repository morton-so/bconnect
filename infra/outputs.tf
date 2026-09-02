# 사용처 : 가비아 
output "cf_domain" {
  description = "CloudFront 도메인"
  value       = module.aws.cf_domain
}

# 사용처 : 가비아
output "acm_validation_records" {
  description = "ACM 인증서 DNS 검증용 CNAME 레코드"
  value       = module.aws.acm_validation_records
}
