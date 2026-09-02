variable "github_repo" {
  description = "GitHub 원격저장소"
  type        = string
}

variable "database_url" {
  description = "원클릭 적재 DB TCP 프록시 URL (현재 prod)"
  type        = string
  sensitive   = true
}

variable "data_go_service_key" {
  description = "공공데이터 조회 서비스 키"
  type        = string
  sensitive   = true
}

variable "sentry_auth_token" {
  description = "Sentry 소스맵 · 소스 컨텍스트 업로드 토큰"
  type        = string
  sensitive   = true
}

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
