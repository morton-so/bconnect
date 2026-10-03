terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 5.0"
    }
  }
}

provider "vercel" {
  api_token = var.token
  team      = "morton-so"
}

locals {
  api_url_prod = "https://api.${var.domain}"
}
