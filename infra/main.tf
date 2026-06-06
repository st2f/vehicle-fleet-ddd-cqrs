resource "aws_ssm_parameter" "terraform_smoke_test" {
  name  = "/ci-practice/lab/terraform-smoke-test"
  type  = "String"
  value = "ok"
}

resource "aws_ecr_repository" "practice" {
  name                 = "ecr-repo-practice"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "policy_ecr_practice" {
  repository = aws_ecr_repository.practice.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}