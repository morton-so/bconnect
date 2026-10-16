variable "project_id" {
  description = "GCP/Firebase 프로젝트 ID"
  type        = string
  default     = "bconnect-f0bee"
}

variable "project_name" {
  description = "Firebase 프로젝트 이름"
  type        = string
  default     = "bconnect"
}

variable "region" {
  description = "GCP 리전"
  type        = string
  default     = "asia-northeast3"
}

variable "billing_account_id" {
  description = "결제 계정 ID (Spark 플랜이면 null)"
  type        = string
  default     = null
  sensitive   = true
}