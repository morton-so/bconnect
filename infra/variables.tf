# 본 파일은 테라폼 환경변수의 설정값 · 공개값 · 비밀값을 정의합니다.

# =============================================================================
# 설정값 : default 필수
# =============================================================================

# GitHub
variable "github_repo" {
  description = "GitHub 원격저장소"
  type        = string
  default     = "mortonCareer/bconnect"
}

variable "github_branch" {
  description = "Git 배포용 브랜치"
  type        = string
  default     = "main"
}

# AWS
variable "aws_region" {
  description = "AWS 기본 리전"
  type        = string
  default     = "ap-northeast-2"
}

# 도메인
variable "domain" {
  description = "루트 도메인"
  type        = string
  default     = "bconnect.to"
}

variable "api_url_dev" {
  description = "API 서버 URL (dev)"
  type        = string
  default     = "https://api.dev.bconnect.to"
}

# Firebase
variable "firebase_project_id" {
  description = "GCP/Firebase 프로젝트 ID"
  type        = string
  default     = "bconnect-f0bee"
}

variable "firebase_project_name" {
  description = "Firebase 프로젝트 이름"
  type        = string
  default     = "bconnect"
}

# =============================================================================
# 공개키 : default 필수
# =============================================================================

# Firebase
variable "fcm_vapid_key" {
  description = "FCM 인증용 VAPID 공개키"
  type        = string
  default     = "BGyw-MR9vfVlaY4VK-ckYyYCsIMH7a3ZywwSyH6xGGZGGgvJZQKzHhI-ucNF7plUpSmKiSVZH9JnlQop9oMsRV4"
}

# =============================================================================
# 비밀키 : sensitive
# =============================================================================

# Vercel
variable "vercel_token" {
  description = "Vercel 프로바이더 인증 토큰"
  type        = string
  sensitive   = true
}

# 원클릭 조회
variable "data_go_service_key" {
  description = "공공데이터 조회 서비스 키"
  type        = string
  sensitive   = true
}

variable "database_url" {
  description = "원클릭 적재 DB TCP 프록시 URL (현재 prod)"
  type        = string
  sensitive   = true
}

# Sentry
variable "sentry_auth_token" {
  description = "Sentry 소스맵 · 소스 컨텍스트 업로드 토큰"
  type        = string
  sensitive   = true
}

# Firebase
variable "firebase_billing_account_id" {
  description = "결제 계정 ID (Spark 플랜이면 null)"
  type        = string
  sensitive   = true
  default     = null
}

variable "fcm_credential" {
  description = "FCM HTTP v1 서비스 계정 키 JSON"
  type        = string
  sensitive   = true
}

# GitHub Actions
variable "figma_access_token" {
  description = "Figma API 액세스 토큰"
  type        = string
  sensitive   = true
}

variable "slack_webhook_url" {
  description = "Slack 모니터링 알림 웹훅 URL"
  type        = string
  sensitive   = true
}
