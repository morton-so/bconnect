locals {
  company_env = {
    SENTRY_AUTH_TOKEN = var.sentry_auth_token
  }

  company_env_prod = {
    API_URL = local.api_url_prod
  }

  company_env_dev = {
    API_URL = var.api_url_dev
  }
}

resource "vercel_project_environment_variable" "company_env" {
  for_each               = local.company_env
  project_id             = vercel_project.company.id
  key                    = each.key
  value                  = each.value
  target                 = ["production", "preview"]
  custom_environment_ids = [vercel_custom_environment.company_dev.id]
  sensitive              = true
}

resource "vercel_project_environment_variable" "company_env_prod" {
  for_each   = local.company_env_prod
  project_id = vercel_project.company.id
  key        = each.key
  value      = each.value
  target     = ["production"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "company_env_dev" {
  for_each               = local.company_env_dev
  project_id             = vercel_project.company.id
  key                    = each.key
  value                  = each.value
  target                 = ["preview"]
  custom_environment_ids = [vercel_custom_environment.company_dev.id]
  sensitive              = true
}

# Company 프로젝트 등록
resource "vercel_project" "company" {
  name                                              = "bconnect-company"
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
  root_directory               = "apps/company"
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
resource "vercel_project_domain" "company" {
  project_id = vercel_project.company.id
  domain     = var.domain
}

resource "vercel_project_domain" "company_dev" {
  project_id            = vercel_project.company.id
  domain                = "dev.${var.domain}"
  custom_environment_id = vercel_custom_environment.company_dev.id
}

# 프리뷰 설정
resource "vercel_custom_environment" "company_dev" {
  project_id  = vercel_project.company.id
  name        = "dev"
  description = "dev 브랜치 프리뷰 설정"
  branch_tracking = {
    pattern = "dev"
    type    = "equals"
  }
}
