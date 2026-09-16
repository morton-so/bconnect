locals {
  s3_buckets = {
    prod = "bconnect-storage"
    dev  = "bconnect-storage-dev"
  }
}

resource "aws_s3_bucket" "storage" {
  for_each = local.s3_buckets
  bucket   = each.value

  lifecycle {
    create_before_destroy = true
  }
}

# 공개 접근 차단
resource "aws_s3_bucket_public_access_block" "storage" {
  for_each                = local.cdns
  bucket                  = each.value.bucket_id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# OAC 정책
resource "aws_s3_bucket_policy" "storage" {
  for_each = local.cdns
  bucket   = each.value.bucket_id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFrontOAC"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${each.value.bucket_arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.static[each.key].arn
        }
      }
    }]
  })
}

# 앱 접근 허용 설정
resource "aws_s3_bucket_cors_configuration" "storage" {
  for_each = local.cdns
  bucket   = each.value.bucket_id

  cors_rule {
    allowed_methods = ["PUT"]
    allowed_origins = each.value.cors_origins
    allowed_headers = ["Content-Type", "Content-Length"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3600
  }
}
