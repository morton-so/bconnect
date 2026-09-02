variable "region" {
  description = "AWS 기본 리전"
  type        = string
  default     = "ap-northeast-2"
}

variable "fcm_credential" {
  description = "FCM HTTP v1 서비스 계정 키 JSON"
  type        = string
  sensitive   = true
}

variable "domain" {
  description = "루트 도메인"
  type        = string
}

