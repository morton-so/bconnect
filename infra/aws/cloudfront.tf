# 환경별 웹 오리진 목록 (CORS 허용 대상)
locals {
  web_origins = {
    prod = [
      "https://${var.domain}",
      "https://career.${var.domain}",
      "https://plan.${var.domain}",
    ]
    dev = [
      "https://dev.${var.domain}",
      "https://career.dev.${var.domain}",
      "https://plan.dev.${var.domain}",
    ]
  }
}

# CDN 기본 설정
locals {
  s3_origin_id = "bconnect-static"
  cdns = {
    prod = {
      domain                 = "static.${var.domain}"
      cert_domain            = "static.${var.domain}"
      bucket_id              = aws_s3_bucket.storage["prod"].id
      bucket_arn             = aws_s3_bucket.storage["prod"].arn
      bucket_regional_domain = aws_s3_bucket.storage["prod"].bucket_regional_domain_name
      cors_origins           = local.web_origins["prod"]
    }
    dev = {
      domain                 = "static.dev.${var.domain}"
      cert_domain            = "*.dev.${var.domain}"
      bucket_id              = aws_s3_bucket.storage["dev"].id
      bucket_arn             = aws_s3_bucket.storage["dev"].arn
      bucket_regional_domain = aws_s3_bucket.storage["dev"].bucket_regional_domain_name
      cors_origins           = local.web_origins["dev"]
    }
  }
}

# 서명 쿠키용 비밀키
resource "tls_private_key" "signed_cookie" {
  for_each  = local.cdns
  algorithm = "RSA"
  rsa_bits  = 2048
}

# 서명 쿠키용 공개키 등록
resource "aws_cloudfront_public_key" "signed_cookie" {
  for_each    = local.cdns
  name        = "bconnect-signed-cookie-${each.key}"
  encoded_key = tls_private_key.signed_cookie[each.key].public_key_pem
}

# 서명 쿠키용 키 그룹 설정
resource "aws_cloudfront_key_group" "signed_cookie" {
  for_each = local.cdns
  name     = "bconnect-signed-cookie-${each.key}"
  items    = [aws_cloudfront_public_key.signed_cookie[each.key].id]
}

# ACM 인증서 설정 (us-east-1 필수)
resource "aws_acm_certificate" "static" {
  for_each          = local.cdns
  provider          = aws.us_east_1
  domain_name       = each.value.cert_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# 도메인 변경시 인증서 등록 절차
# 1) terraform apply -target='module.aws.aws_acm_certificate.static' : 인증서 생성
# 2) terraform output acm_validation_records : 가비아 CNAME 등록
# 3) terraform apply : ISSUED 확인 후 distribution
resource "aws_acm_certificate_validation" "static" {
  for_each        = local.cdns
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.static[each.key].arn
}

# OAC 설정
resource "aws_cloudfront_origin_access_control" "static" {
  for_each                          = local.cdns
  name                              = "bconnect-static-${each.key}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# 관리형 캐시 정책
data "aws_cloudfront_cache_policy" "optimized" {
  name = "Managed-CachingOptimized"
}

# CloudFront 배포
resource "aws_cloudfront_distribution" "static" {
  for_each        = local.cdns
  enabled         = true
  is_ipv6_enabled = true
  comment         = "${each.value.domain} 정적파일 (공개 + 비공개 서명 쿠키)"
  aliases         = [each.value.domain]
  price_class     = "PriceClass_200" # 서울 리전 최소비용

  origin {
    domain_name              = each.value.bucket_regional_domain # 리전 도메인 필수
    origin_id                = local.s3_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.static[each.key].id
  }

  # 기본 비공개 설정 (중요)
  default_cache_behavior {
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = data.aws_cloudfront_cache_policy.optimized.id
    trusted_key_groups     = [aws_cloudfront_key_group.signed_cookie[each.key].id]
  }

  # 비공개 예외 설정
  ordered_cache_behavior {
    path_pattern           = "members/*"
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = data.aws_cloudfront_cache_policy.optimized.id
  }

  ordered_cache_behavior {
    path_pattern           = "posts/*"
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = data.aws_cloudfront_cache_policy.optimized.id
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.static[each.key].certificate_arn # 검증된 인증서
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}
