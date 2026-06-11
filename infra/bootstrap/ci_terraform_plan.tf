data "aws_caller_identity" "current" {}

locals {
  github_ci_role_name       = "github-ci-role"
  app_reports_bucket_name   = "ci-practice-reports-${data.aws_caller_identity.current.account_id}"
  app_reports_bucket_arn    = "arn:aws:s3:::${local.app_reports_bucket_name}"
  app_reports_write_policy  = "policy-s3-ci-reports-write"
  plan_read_policy_name     = "policy-github-ci-terraform-plan-read"
  terraform_smoke_test_name = "/ci-practice/lab/terraform-smoke-test"
}

# This is operator/bootstrap permission: it lets GitHub Actions refresh the
# app stack during terraform plan. It does not belong to the app stack itself.
data "aws_iam_policy_document" "github_ci_terraform_plan_read" {
  statement {
    actions = [
      "s3:GetBucketLocation",
      "s3:GetBucketPublicAccessBlock",
      "s3:GetEncryptionConfiguration",
      "s3:GetLifecycleConfiguration",
      "s3:GetBucketVersioning",
      "s3:GetBucketTagging",
      "s3:GetBucketAcl",
      "s3:GetBucketCORS",
      "s3:GetBucketPolicy",
      "s3:GetBucketLogging",
      "s3:GetBucketWebsite",
      "s3:GetBucketRequestPayment",
      "s3:GetBucketObjectLockConfiguration",
      "s3:GetAccelerateConfiguration",
      "s3:GetReplicationConfiguration",
      "s3:ListBucket",
    ]

    resources = [
      local.app_reports_bucket_arn,
    ]
  }

  statement {
    actions = [
      "ecr:DescribeImages",
      "ecr:DescribeRepositories",
      "ecr:GetLifecyclePolicy",
      "ecr:GetRepositoryPolicy",
      "ecr:ListTagsForResource",
    ]

    resources = [
      "arn:aws:ecr:eu-north-1:${data.aws_caller_identity.current.account_id}:repository/ecr-repo-practice",
    ]
  }

  statement {
    actions = [
      "ssm:DescribeParameters",
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:ListTagsForResource",
    ]

    resources = [
      "arn:aws:ssm:eu-north-1:${data.aws_caller_identity.current.account_id}:parameter${local.terraform_smoke_test_name}",
    ]
  }

  statement {
    actions = [
      "iam:GetPolicy",
      "iam:GetPolicyVersion",
      "iam:GetRole",
      "iam:ListAttachedRolePolicies",
      "iam:ListPolicyVersions",
      "iam:ListRolePolicies",
    ]

    resources = [
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/${local.app_reports_write_policy}",
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/${local.plan_read_policy_name}",
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${local.github_ci_role_name}",
    ]
  }
}

resource "aws_iam_policy" "github_ci_terraform_plan_read" {
  name        = local.plan_read_policy_name
  description = "Allow GitHub Actions to refresh Terraform-managed lab resources during plan"
  policy      = data.aws_iam_policy_document.github_ci_terraform_plan_read.json
}

resource "aws_iam_role_policy_attachment" "github_ci_terraform_plan_read" {
  role       = local.github_ci_role_name
  policy_arn = aws_iam_policy.github_ci_terraform_plan_read.arn
}

output "github_ci_terraform_plan_read_policy_arn" {
  value = aws_iam_policy.github_ci_terraform_plan_read.arn
}
