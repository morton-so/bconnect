# https://morton-so.signin.aws.amazon.com/console
resource "aws_iam_account_alias" "login" {
  account_alias = "morton-so"
}

# 어드민 선언
resource "aws_iam_group" "admin" {
  name = "Admins"
}

# 어드민 권한 등록
resource "aws_iam_group_policy_attachment" "admin" {
  group      = aws_iam_group.admin.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

# 개발자 선언
resource "aws_iam_group" "developer" {
  name = "Developers"
}

# 개발자 권한 등록
resource "aws_iam_group_policy_attachment" "developer" {
  group      = aws_iam_group.developer.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}
