# 사용자-그룹 매핑
locals {
  users = {
    cto = {
      groups = ["Admins"]
    }
    backend = {
      groups = ["Developers"]
    }
  }
}

# IAM 유저 생성
resource "aws_iam_user" "users" {
  for_each = local.users
  name     = each.key
}

# IAM 유저를 그룹에 매핑
resource "aws_iam_user_group_membership" "users" {
  for_each = local.users
  user     = aws_iam_user.users[each.key].name
  groups   = each.value.groups
}

# 비밀번호 변경 허용
resource "aws_iam_user_policy_attachment" "change_password" {
  for_each   = local.users
  user       = aws_iam_user.users[each.key].name
  policy_arn = "arn:aws:iam::aws:policy/IAMUserChangePassword"
}
