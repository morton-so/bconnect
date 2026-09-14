variable "token" {
  description = "Vercel 프로바이더 인증 토큰"
  type        = string
  sensitive   = true
}

variable "domain" {
  description = "루트 도메인"
  type        = string
}

variable "api_url_dev" {
  description = "API 서버 URL (dev)"
  type        = string
}

variable "github_repo" {
  description = "GitHub 원격저장소"
  type        = string
}

variable "github_branch" {
  description = "Git 배포용 브랜치"
  type        = string
  default     = "main"
}

# Lambda 호출용 AWS 자격증명
variable "aws_access_key_id" {
  description = "앱 전용 IAM 액세스 키"
  type        = string
  sensitive   = true
}

variable "aws_secret_access_key" {
  description = "앱 전용 IAM 시크릿 키"
  type        = string
  sensitive   = true
}

variable "aws_region" {
  description = "AWS 기본 리전"
  type        = string
  default     = "ap-northeast-2"
}

variable "sentry_auth_token" {
  description = "Sentry 소스맵 · 소스 컨텍스트 업로드 토큰"
  type        = string
  sensitive   = true
}

variable "firebase_web_configs" {
  description = "FCM SDK 앱 설정"
  type = map(object({
    api_key             = string
    auth_domain         = string
    project_id          = string
    storage_bucket      = string
    messaging_sender_id = string
    app_id              = string
  }))
  sensitive = true
}

variable "fcm_vapid_key" {
  description = "FCM 인증용 VAPID 공개키"
  type        = string
}
