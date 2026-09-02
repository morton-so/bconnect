terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 6.0"
    }
  }
}

provider "google-beta" {
  region                = var.region
  billing_project       = var.project_id
  user_project_override = true # 사용자 대신 프로젝트 기준 과금
}

# 모니터링 분리를 위해 앱 개별 등록
locals {
  web_apps = {
    career = "BConnect Career"
    plan   = "BConnect Plan"
  }
}

# GCP 프로젝트 생성
resource "google_project" "bconnect" {
  provider        = google-beta
  project_id      = var.project_id
  name            = var.project_name
  billing_account = var.billing_account_id # Spark 플랜이면 null
  labels = {
    environment = "prod"
    managed_by  = "terraform"
  }
}

# GCP 서비스 활성화
resource "google_project_service" "apis" {
  provider = google-beta
  project  = google_project.bconnect.project_id

  for_each = toset([
    "firebase.googleapis.com",
    "fcm.googleapis.com",
    "cloudresourcemanager.googleapis.com",
  ])
  service            = each.value
  disable_on_destroy = false
}

# Firebase 활성화
resource "google_firebase_project" "bconnect" {
  provider   = google-beta
  project    = google_project.bconnect.project_id
  depends_on = [google_project_service.apis]
}

# sdk 계정에 FCM 권한 부여
resource "google_project_iam_member" "fcm_sender" {
  provider = google-beta
  project  = google_firebase_project.bconnect.project
  role     = "roles/firebasecloudmessaging.admin"
  member   = "serviceAccount:firebase-adminsdk-fbsvc@${google_project.bconnect.project_id}.iam.gserviceaccount.com"
}

# 앱별 Firebase 등록
resource "google_firebase_web_app" "apps" {
  for_each        = local.web_apps
  provider        = google-beta
  project         = google_firebase_project.bconnect.project
  display_name    = each.value
  deletion_policy = "DELETE"
}

# 앱별 SDK config 조회
data "google_firebase_web_app_config" "configs" {
  for_each   = local.web_apps
  provider   = google-beta
  project    = google_firebase_project.bconnect.project
  web_app_id = google_firebase_web_app.apps[each.key].app_id
}
