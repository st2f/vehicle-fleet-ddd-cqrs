[![Terraform](https://github.com/st2f/vehicle-fleet-ddd-cqrs/actions/workflows/terraform.yml/badge.svg?branch=experiment%2Faws-ci-ecr-s3)](https://github.com/st2f/vehicle-fleet-ddd-cqrs/actions/workflows/terraform.yml)

# Terraform infrastructure

## Sections

- [Bootstrap infrastructure](bootstrap/README.md)
- [Terraform smoke test](#1-terraform-smoke-test)
- [GitHub Actions](#2-github-actions)
- [Container registry](#3-container-registry)
- [Reports storage](#4-reports-storage)
- [App health/version runtime](#5-app-healthversion-runtime)
- [CI image pipeline](#6-ci-image-pipeline)

## 1. Terraform smoke test

The goal is to create one small SSM parameter to prove that AWS access,
remote state, locking, provider tags, and state tracking work.

```hcl
resource "aws_ssm_parameter" "terraform_smoke_test" {
  name  = "/ci-practice/lab/terraform-smoke-test"
  type  = "String"
  value = "ok"
}
```

When running Terraform commands, the current AWS terminal profile is used.
Check it before applying changes:

```sh
aws sts get-caller-identity
```

The active AWS identity must have enough privileges to create this parameter.

```sh
cd infra
```

Initialize Terraform:

```sh
terraform init
```

Validate the configuration:

```sh
terraform validate
```

Preview the resource Terraform will create:

```sh
terraform plan
```

Apply the planned change:

```sh
terraform apply
```

After applying, run a final plan:

```sh
terraform plan
```

It should show:

```text
No changes. Your infrastructure matches the configuration.
```

The smoke test verifies that:

- Terraform can initialize with the S3 backend.
- Terraform can use the S3 lockfile.
- The AWS provider can authenticate.
- Default tags are applied.
- Terraform can create and track a real AWS resource.

### Result

Terraform successfully created the smoke-test parameter and applied the default tags.

<img width="700" alt="aws param store" src="https://github.com/user-attachments/assets/96a079dc-1dfd-4354-9218-91f95efacba9" />

## 2. GitHub Actions

The workflow validates the same Terraform workflow used locally: init, validate and plan.
The difference is that local runs use the current AWS identity, while GitHub Actions authenticates through OIDC and assumes the github-ci-role.

<img width="700" alt="GitHub CI results" src="https://github.com/user-attachments/assets/42e54dc1-a2a6-4010-a26c-96b630c02f0d" />

## 3. Container registry

Terraform manages an ECR repository used to store application container images.

The repository enables:

- pushing Docker images from CI
- pulling images for future deployment targets
- scanning images on push
- expiring old images with a lifecycle policy

---

For learning purposes, `terraform apply` is still run locally with the current AWS terminal identity

<img width="600" alt="terraform apply" src="https://github.com/user-attachments/assets/f8b2f437-4869-4424-b6ac-9e0032f2c2e2" />

<img width="600" alt="ECR lifecycle policy" src="https://github.com/user-attachments/assets/f8bf9684-942f-4160-951e-0ed94386e008" />

### Resources

| Type                 | Name              | Purpose                       |
| -------------------- | ----------------- | ----------------------------- |
| ECR Repository       | ecr-repo-practice | Store application images      |
| ECR Lifecycle Policy | ecr-repo-practice | Expire old application images |

<img width="700" alt="GitHub CI results" src="https://github.com/user-attachments/assets/25c48510-c948-4e51-ab65-b6c9a7b25933" />

## 4. Reports storage

Terraform now manages an S3 bucket used to store generated CI reports and
artifacts. The reports bucket enables:

- uploading Cucumber or test reports from GitHub Actions
- keeping reports private by blocking public access
- encrypting report objects with S3-managed encryption
- preserving object versions while the bucket is active
- expiring old reports automatically with a lifecycle rule
- granting the GitHub CI role write access only under the `reports/` prefix

The bucket name and ARN are defined with Terraform locals so the generated plan
shows the exact S3 target before applying:

```hcl
locals {
  ci_reports_bucket_name = "ci-practice-reports-${data.aws_caller_identity.current.account_id}"
  ci_reports_bucket_arn  = "arn:aws:s3:::${local.ci_reports_bucket_name}"
}
```

### Resources

| Type                        | Name                        | Purpose                      |
| --------------------------- | --------------------------- | ---------------------------- |
| S3 Bucket                   | ci-practice-reports-ACCOUNT | Store generated CI reports   |
| S3 Public Access Block      | ci_reports                  | Keep the bucket private      |
| S3 Encryption Configuration | ci_reports                  | Encrypt report objects       |
| S3 Versioning Configuration | ci_reports                  | Keep object versions         |
| S3 Lifecycle Configuration  | expire-old-ci-reports       | Expire reports after 30 days |
| IAM Policy                  | policy-s3-ci-reports-write  | Allow CI report uploads      |
| IAM Role Policy Attachment  | github_ci_reports_write     | Attach report upload policy  |

### Access and permissions

| Source         | Permission / Policy        | Target                                  |
| -------------- | -------------------------- | --------------------------------------- |
| github-ci-role | policy-s3-ci-reports-write | `ci-practice-reports-ACCOUNT/reports/*` |

## 5. App health/version runtime

The application exposes a minimal HTTP runtime so a container image can be
started and verified before it is pushed or deployed.

The runtime intentionally has only two endpoints:

| Method | Path       | Purpose                       |
| ------ | ---------- | ----------------------------- |
| GET    | `/health`  | Prove the process is running  |
| GET    | `/version` | Report the running app build  |

Run it locally from TypeScript:

```sh
npm run serve
```

Or run the compiled entrypoint, which is what a container image should use:

```sh
npm run build
npm start
```

Verify the runtime:

```sh
curl http://localhost:3000/health
curl http://localhost:3000/version
```

Expected responses:

```json
{"status":"ok"}
```

```json
{"name":"vehicle-fleet-ddd-cqrs","version":"1.0.0"}
```

The port defaults to `3000` and can be overridden with `PORT`. The reported
version comes from `APP_VERSION` when set, otherwise from the npm package
version.

## 6. CI image pipeline

TODO

Once infra is in place, turn the ECR repository into a real delivery checkpoint.

1. Run quality checks and generate a test report.
2. Upload the report to the reports S3 bucket.
3. Build a Docker image only after tests succeed.
4. Start the image inside CI and verify it with `curl /health` or `curl /version`.
5. Push the image to ECR only after the image has been proven runnable.
6. Tag the image with the Git commit SHA for traceability.
