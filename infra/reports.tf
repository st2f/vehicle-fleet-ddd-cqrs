data "aws_caller_identity" "current" {}

# Set some variables to avoid reviewing plan with (known after apply)
locals {
  github_ci_role_name    = "github-ci-role"
  ci_reports_bucket_name = "ci-practice-reports-${data.aws_caller_identity.current.account_id}"
  ci_reports_bucket_arn  = "arn:aws:s3:::${local.ci_reports_bucket_name}"
}

# CI reports bucket
resource "aws_s3_bucket" "ci_reports" {
  bucket = local.ci_reports_bucket_name
}

# Bucket security settings
resource "aws_s3_bucket_public_access_block" "ci_reports" {
  bucket = aws_s3_bucket.ci_reports.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "ci_reports" {
  bucket = aws_s3_bucket.ci_reports.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "ci_reports" {
  bucket = aws_s3_bucket.ci_reports.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Bucket retention policy
resource "aws_s3_bucket_lifecycle_configuration" "ci_reports" {
  bucket = aws_s3_bucket.ci_reports.id

  rule {
    id     = "expire-old-ci-reports"
    status = "Enabled"

    filter {
      prefix = "reports/"
    }

    expiration {
      days = 30
    }

    noncurrent_version_expiration {
      noncurrent_days = 7
    }
  }
}

# GitHub Actions permissions
data "aws_iam_policy_document" "github_ci_reports_write" {
  statement {
    actions = [
      "s3:GetBucketLocation",
      "s3:ListBucket",
    ]

    resources = [
      local.ci_reports_bucket_arn,
    ]

    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values   = ["reports/*"]
    }
  }

  statement {
    actions = [
      "s3:PutObject",
    ]

    resources = [
      "${local.ci_reports_bucket_arn}/reports/*",
    ]
  }
}

resource "aws_iam_policy" "github_ci_reports_write" {
  name        = "policy-s3-ci-reports-write"
  description = "Allow GitHub Actions to upload CI reports"
  policy      = data.aws_iam_policy_document.github_ci_reports_write.json
}

resource "aws_iam_role_policy_attachment" "github_ci_reports_write" {
  role       = local.github_ci_role_name
  policy_arn = aws_iam_policy.github_ci_reports_write.arn
}

# Useful value for CI / documentation
output "ci_reports_bucket_name" {
  value = aws_s3_bucket.ci_reports.bucket
}
