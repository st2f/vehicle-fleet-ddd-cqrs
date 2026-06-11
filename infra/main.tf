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

data "aws_iam_policy_document" "github_ci_ecr_push" {
  statement {
    actions = [
      "ecr:GetAuthorizationToken",
    ]

    resources = ["*"]
  }

  statement {
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:DescribeRepositories",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart",
    ]

    resources = [
      aws_ecr_repository.practice.arn,
    ]
  }
}

resource "aws_iam_policy" "github_ci_ecr_push" {
  name        = "policy-ecr-ci-image-push"
  description = "Allow GitHub Actions to push verified application images"
  policy      = data.aws_iam_policy_document.github_ci_ecr_push.json
}

resource "aws_iam_role_policy_attachment" "github_ci_ecr_push" {
  role       = local.github_ci_role_name
  policy_arn = aws_iam_policy.github_ci_ecr_push.arn
}
