# 앱(Career, Plan 등) 전용 IAM 설정

# IAM 유저
resource "aws_iam_user" "app" {
  name = "bconnect-app"
  path = "/app/"
}

# IAM 유저 액세스 키
resource "aws_iam_access_key" "app" {
  user = aws_iam_user.app.name
}

# S3 · SNS · Lambda 접근 권한 정책
resource "aws_iam_policy" "app" {
  name        = "BconnectAppAccess"
  path        = "/"
  description = "S3 · SNS · Lambda 접근 허용"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3Access"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = flatten([
          for bucket in aws_s3_bucket.storage : [bucket.arn, "${bucket.arn}/*"]
        ])
      },
      {
        Sid    = "SNSAccess"
        Effect = "Allow"
        Action = [
          "sns:Publish",
          "sns:CreatePlatformEndpoint",
          "sns:GetEndpointAttributes",
          "sns:SetEndpointAttributes",
          "sns:DeleteEndpoint"
        ]
        Resource = ["*"]
      },
      {
        Sid      = "LambdaInvoke"
        Effect   = "Allow"
        Action   = "lambda:InvokeFunction"
        Resource = "arn:aws:lambda:${var.region}:*:function:instagram-parser"
      }
    ]
  })
}

# IAM 유저에게 권한 부여
resource "aws_iam_user_policy_attachment" "app_access" {
  user       = aws_iam_user.app.name
  policy_arn = aws_iam_policy.app.arn
}
