locals {
  career_env_prod = {
    NEXT_PUBLIC_API_URL = local.api_url_prod
    API_URL             = local.api_url_prod
  }

  career_env_dev = {
    NEXT_PUBLIC_API_URL = var.api_url_dev
    API_URL             = var.api_url_dev
  }

  career_env = {
    AWS_ACCESS_KEY_ID     = var.aws_access_key_id
    AWS_SECRET_ACCESS_KEY = var.aws_secret_access_key
    AWS_REGION            = var.aws_region
    SENTRY_AUTH_TOKEN     = var.sentry_auth_token

    NEXT_PUBLIC_FIREBASE_API_KEY             = var.firebase_web_configs["career"].api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN         = var.firebase_web_configs["career"].auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID          = var.firebase_web_configs["career"].project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET      = var.firebase_web_configs["career"].storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = var.firebase_web_configs["career"].messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID              = var.firebase_web_configs["career"].app_id
    NEXT_PUBLIC_FIREBASE_VAPID_KEY           = var.fcm_vapid_key
  }
}

resource "vercel_project_environment_variable" "career_env" {
  for_each               = local.career_env
  project_id             = vercel_project.career.id
  key                    = each.key
  value                  = each.value
  target                 = ["production", "preview"]
  custom_environment_ids = [vercel_custom_environment.career_dev.id]
  sensitive              = true
}

resource "vercel_project_environment_variable" "career_env_prod" {
  for_each   = local.career_env_prod
  project_id = vercel_project.career.id
  key        = each.key
  value      = each.value
  target     = ["production"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "career_env_dev" {
  for_each               = local.career_env_dev
  project_id             = vercel_project.career.id
  key                    = each.key
  value                  = each.value
  target                 = ["preview"]
  custom_environment_ids = [vercel_custom_environment.career_dev.id]
  sensitive              = true
}

# Career 프로젝트 등록
resource "vercel_project" "career" {
  name                                              = "bconnect-career"
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
  root_directory               = "apps/career"
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
resource "vercel_project_domain" "career" {
  project_id = vercel_project.career.id
  domain     = "career.${var.domain}"
}

resource "vercel_project_domain" "career_dev" {
  project_id            = vercel_project.career.id
  domain                = "career.dev.${var.domain}"
  custom_environment_id = vercel_custom_environment.career_dev.id
}

# 프리뷰 설정
resource "vercel_custom_environment" "career_dev" {
  project_id  = vercel_project.career.id
  name        = "dev"
  description = "dev 브랜치 프리뷰 설정"
  branch_tracking = {
    pattern = "dev"
    type    = "equals"
  }
}
