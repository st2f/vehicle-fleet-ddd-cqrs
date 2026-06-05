resource "aws_ssm_parameter" "terraform_smoke_test" {
  name  = "/ci-practice/lab/terraform-smoke-test"
  type  = "String"
  value = "ok"
}