# 사용처 : vercel
output "web_configs" {
  description = "앱별 Firebase SDK 설정"
  value = {
    for key, _ in local.web_apps :
    key => {
      api_key             = data.google_firebase_web_app_config.configs[key].api_key
      auth_domain         = data.google_firebase_web_app_config.configs[key].auth_domain
      project_id          = google_firebase_project.bconnect.project
      storage_bucket      = data.google_firebase_web_app_config.configs[key].storage_bucket
      messaging_sender_id = data.google_firebase_web_app_config.configs[key].messaging_sender_id
      app_id              = google_firebase_web_app.apps[key].app_id
    }
  }
  sensitive = true
}
