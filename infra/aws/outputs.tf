# 사용처 : railway
output "s3_buckets" {
  description = "앱 스토리지 버킷명 (prod · dev)"
  value       = { for k, v in aws_s3_bucket.storage : k => v.id }
}

# 사용처 : railway
output "sns_platform_arn" {
  description = "SNS ARN"
  value       = aws_sns_platform_application.fcm.arn
}

# 사용처 : railway · vercel · github
output "access_key_id" {
  description = "애플리케이션 IAM 유저 액세스 키 ID"
  value       = aws_iam_access_key.app.id
  sensitive   = true
}

# 사용처 : railway · vercel · github
output "secret_access_key" {
  description = "애플리케이션 IAM 유저 액세스 비밀키"
  value       = aws_iam_access_key.app.secret
  sensitive   = true
}

# 사용처 : railway
output "cf_key_pair_id" {
  description = "CloudFront 공개키 ID"
  value       = { for k, v in aws_cloudfront_public_key.signed_cookie : k => v.id }
}

# 사용처 : railway
output "cf_private_key" {
  description = "CloudFront 서명 비밀키를 base64 인코딩한 값"
  value       = { for k, v in tls_private_key.signed_cookie : k => base64encode(v.private_key_pem_pkcs8) }
  sensitive   = true
}

# 사용처 : 가비아
output "cf_domain" {
  description = "CDN 도메인"
  value       = { for k, v in aws_cloudfront_distribution.static : k => v.domain_name }
}

# 사용처 : 가비아
output "acm_validation_records" {
  description = "ACM 인증서 DNS 검증용 CNAME 레코드"
  value = {
    for k, cert in aws_acm_certificate.static : k => {
      for dvo in cert.domain_validation_options :
      dvo.domain_name => {
        name  = dvo.resource_record_name
        type  = dvo.resource_record_type
        value = dvo.resource_record_value
      }
    }
  }
}
