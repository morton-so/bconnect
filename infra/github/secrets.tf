locals {
  secrets = {
    DATABASE_URL        = var.database_url
    DATA_GO_SERVICE_KEY = var.data_go_service_key
    SENTRY_AUTH_TOKEN   = var.sentry_auth_token
    FIGMA_ACCESS_TOKEN  = var.figma_access_token
    SLACK_WEBHOOK_URL   = var.slack_webhook_url
  }
}

resource "github_actions_secret" "secrets" {
  for_each    = local.secrets
  repository  = split("/", var.github_repo)[1]
  secret_name = each.key
  value       = each.value
}