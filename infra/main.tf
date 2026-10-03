provider "aws" {
  region = var.aws_region
}

# ACM 인증서용 프로바이더 별칭 설정 (us-east-1 리전 필수)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

module "aws" {
  source         = "./aws"
  region         = var.aws_region
  fcm_credential = var.fcm_credential
  domain         = var.domain

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}

module "firebase" {
  source = "./firebase"

  project_id         = var.firebase_project_id
  project_name       = var.firebase_project_name
  billing_account_id = var.firebase_billing_account_id
}

module "vercel" {
  source = "./vercel"

  token       = var.vercel_token
  domain      = var.domain
  api_url_dev = var.api_url_dev

  github_repo   = var.github_repo
  github_branch = var.github_branch

  aws_access_key_id     = module.aws.access_key_id
  aws_secret_access_key = module.aws.secret_access_key
  aws_region            = var.aws_region

  sentry_auth_token    = var.sentry_auth_token
  firebase_web_configs = module.firebase.web_configs
  fcm_vapid_key        = var.fcm_vapid_key
}

module "github" {
  source      = "./github"
  github_repo = var.github_repo

  database_url        = var.database_url
  data_go_service_key = var.data_go_service_key
  sentry_auth_token   = var.sentry_auth_token

  figma_access_token = var.figma_access_token
  slack_webhook_url  = var.slack_webhook_url
}
