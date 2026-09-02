# 인스타그램 파서

# IAM ROLE 등록
resource "aws_iam_role" "instagram_parser" {
  name = "BconnectInstagramParser"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# ROLE에 로그 정책 부여
resource "aws_iam_role_policy_attachment" "instagram_parser_logs" {
  role       = aws_iam_role.instagram_parser.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# 소스코드 압축
data "archive_file" "instagram_parser" {
  type        = "zip"
  source_file = "${path.module}/lambda/instagram-parser/handler.py"
  output_path = "${path.module}/lambda/instagram-parser/function.zip"
}

# 람다 함수 설정
resource "aws_lambda_function" "instagram_parser" {
  function_name    = "instagram-parser"
  role             = aws_iam_role.instagram_parser.arn
  handler          = "handler.handler"
  runtime          = "python3.12"
  architectures    = ["arm64"]
  timeout          = 60
  memory_size      = 512
  filename         = data.archive_file.instagram_parser.output_path
  source_code_hash = data.archive_file.instagram_parser.output_base64sha256
}

# 이미지 리사이즈
resource "aws_iam_role" "image_resize" {
  name = "BconnectImageResize"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
      }
    ]
  })
}

# ROLE에 로그 정책 부여
resource "aws_iam_role_policy_attachment" "image_resize_logs" {
  role       = aws_iam_role.image_resize.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# 권한 : 원본 조회 + 리사이즈 결과 업로드
resource "aws_iam_role_policy" "image_resize_s3" {
  name = "BconnectImageResizeS3"
  role = aws_iam_role.image_resize.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject"]
        Resource = [for c in local.cdns : "${c.bucket_arn}/*"]
      }
    ]
  })
}

# 소스코드 압축
data "archive_file" "image_resize" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/image-resize"
  output_path = "${path.module}/lambda/image-resize.zip"
  excludes    = ["build.sh", "package-lock.json"]
}

# 람다 함수 설정
resource "aws_lambda_function" "image_resize" {
  function_name    = "image-resize"
  role             = aws_iam_role.image_resize.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  timeout          = 60
  memory_size      = 1024
  filename         = data.archive_file.image_resize.output_path
  source_code_hash = data.archive_file.image_resize.output_base64sha256
}

# S3 호출 허용
resource "aws_lambda_permission" "image_resize_s3" {
  for_each      = local.cdns
  statement_id  = "AllowS3Invoke-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image_resize.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = each.value.bucket_arn
}

# S3 이벤트 전체 연결, 핸들러에서 /images/o/* 필터링
resource "aws_s3_bucket_notification" "image_resize" {
  for_each = local.cdns
  bucket   = each.value.bucket_id

  lambda_function {
    lambda_function_arn = aws_lambda_function.image_resize.arn
    events              = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_lambda_permission.image_resize_s3]
}
