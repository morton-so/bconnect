# SNS 등록
resource "aws_sns_platform_application" "fcm" {
  name                = "bconnect-fcm"
  platform            = "GCM"
  platform_credential = var.fcm_credential

  success_feedback_role_arn    = aws_iam_role.sns_logs.arn
  failure_feedback_role_arn    = aws_iam_role.sns_logs.arn
  success_feedback_sample_rate = 100
}

# 로깅용 IAM ROLE 등록
resource "aws_iam_role" "sns_logs" {
  name = "BconnectSnsLogs"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = { Service = "sns.amazonaws.com" }
      }
    ]
  })
}

# 로그 정책 설정
resource "aws_iam_role_policy" "sns_logs" {
  name = "BconnectSnsLogs"
  role = aws_iam_role.sns_logs.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:PutMetricFilter",
          "logs:PutRetentionPolicy"
        ]
        Resource = ["*"]
      }
    ]
  })
}

# AWS 자격증명 정보 조회
data "aws_caller_identity" "current" {}

# 로그 그룹 설정
resource "aws_cloudwatch_log_group" "sns_fcm_success" {
  name              = "sns/${var.region}/${data.aws_caller_identity.current.account_id}/app/GCM/${aws_sns_platform_application.fcm.name}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "sns_fcm_failure" {
  name              = "sns/${var.region}/${data.aws_caller_identity.current.account_id}/app/GCM/${aws_sns_platform_application.fcm.name}/Failure"
  retention_in_days = 30
}
