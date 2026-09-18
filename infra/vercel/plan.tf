locals {
  plan_env_prod = {
    NEXT_PUBLIC_API_URL = local.api_url_prod
    API_URL             = local.api_url_prod
  }

  plan_env_dev = {
    NEXT_PUBLIC_API_URL = var.api_url_dev
    API_URL             = var.api_url_dev
  }

  plan_env = {
    SENTRY_AUTH_TOKEN = var.sentry_auth_token

    NEXT_PUBLIC_FIREBASE_API_KEY             = var.firebase_web_configs["plan"].api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN         = var.firebase_web_configs["plan"].auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID          = var.firebase_web_configs["plan"].project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET      = var.firebase_web_configs["plan"].storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = var.firebase_web_configs["plan"].messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID              = var.firebase_web_configs["plan"].app_id
    NEXT_PUBLIC_FIREBASE_VAPID_KEY           = var.fcm_vapid_key
  }
}

resource "vercel_project_environment_variable" "plan_env" {
  for_each               = local.plan_env
  project_id             = vercel_project.plan.id
  key                    = each.key
  value                  = each.value
  target                 = ["production", "preview"]
  custom_environment_ids = [vercel_custom_environment.plan_dev.id]
  sensitive              = true
}

resource "vercel_project_environment_variable" "plan_env_prod" {
  for_each   = local.plan_env_prod
  project_id = vercel_project.plan.id
  key        = each.key
  value      = each.value
  target     = ["production"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "plan_env_dev" {
  for_each               = local.plan_env_dev
  project_id             = vercel_project.plan.id
  key                    = each.key
  value                  = each.value
  target                 = ["preview"]
  custom_environment_ids = [vercel_custom_environment.plan_dev.id]
  sensitive              = true
}

# Plan 프로젝트 등록
resource "vercel_project" "plan" {
  name                                              = "bconnect-plan"
  framework                                         = "nextjs"
  automatically_expose_system_environment_variables = true

  git_repository = {
    type              = "github"
    repo              = var.github_repo
    production_branch = var.github_branch
  }

  oidc_token_config = {
    issuer_mode = "team"
  }

  skew_protection              = "12 hours"
  root_directory               = "apps/plan"
  preview_deployments_disabled = true # 프리뷰 비활성화

  # 봇 코멘트 비활성화
  git_comments = {
    on_commit       = false
    on_pull_request = false
  }

  # 프리뷰 인증 비활성화
  vercel_authentication = {
    deployment_type = "none"
  }
}

# 도메인 설정
resource "vercel_project_domain" "plan" {
  project_id = vercel_project.plan.id
  domain     = "plan.${var.domain}"
}

resource "vercel_project_domain" "plan_dev" {
  project_id            = vercel_project.plan.id
  domain                = "plan.dev.${var.domain}"
  custom_environment_id = vercel_custom_environment.plan_dev.id
}

# 프리뷰 설정
resource "vercel_custom_environment" "plan_dev" {
  project_id  = vercel_project.plan.id
  name        = "dev"
  description = "dev 브랜치 프리뷰 설정"
  branch_tracking = {
    pattern = "dev"
    type    = "equals"
  }
}
