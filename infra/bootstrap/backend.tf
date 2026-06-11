terraform {
  backend "s3" {
    bucket       = "terraform-state-stef"
    key          = "ci-practice/bootstrap/terraform.tfstate"
    region       = "eu-north-1"
    use_lockfile = true
    encrypt      = true
  }
}
