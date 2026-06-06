[![Terraform](https://github.com/st2f/vehicle-fleet-ddd-cqrs/actions/workflows/terraform.yml/badge.svg?branch=experiment%2Faws-ci-ecr-s3)](https://github.com/st2f/vehicle-fleet-ddd-cqrs/actions/workflows/terraform.yml)

# Terraform infrastructure

## Current progress

| Status | Step                |
| ------ | ------------------- |
| ✅     | AWS bootstrap       |
| ✅     | Terraform backend   |
| ✅     | OIDC authentication |
| ✅     | Smoke test          |
| ✅     | ECR repository      |
| 🚧     | Reports bucket      |
| 🚧     | GitHub image push   |

This folder contains the Terraform configuration used to provision and manage
the AWS infrastructure for this learning project. The setup starts with the foundations:
where Terraform stores its state, how changes are locked, and how CI gets
temporary AWS access without storing long-lived secrets.

The work is split into small steps so each concept can be tested before adding
real application infrastructure.

## 1. AWS bootstrap

Done manually before Terraform can run. This step teaches the infrastructure
foundation Terraform depends on:

- Terraform remote state stores the shared infrastructure state in S3 instead
  of only on one local machine.
- S3 lockfile support prevents two Terraform runs from changing the same state
  at the same time (backend.tf / `use_lockfile = true`).
- The GitHub OIDC provider lets GitHub Actions request temporary AWS credentials
  without storing an AWS access key in GitHub.
- The IAM role defines what GitHub Actions is allowed to do after it authenticates.

### Resources

| Type          | Name                                | Purpose                        |
| ------------- | ----------------------------------- | ------------------------------ |
| OIDC Provider | token.actions.githubusercontent.com | GitHub identity provider       |
| IAM Role      | github-ci-role                      | Role assumed by GitHub Actions |
| S3 Bucket     | terraform-state                     | Terraform remote state         |
| SSM Parameter | terraform-smoke-test                | Terraform smoke test           |

### Access and permissions

| Source                       | Permission / Policy             | Target               |
| ---------------------------- | ------------------------------- | -------------------- |
| GitHub Actions (`repo-name`) | AssumeRoleWithWebIdentity       | github-ci-role       |
| github-ci-role               | policy-s3-terraform-state       | terraform-state      |
| github-ci-role               | policy-ssm-terraform-smoke-test | terraform-smoke-test |

## 2. Terraform smoke test

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

If the backend configuration changes, reinitialize with:

```sh
terraform init -reconfigure
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

## 3. GitHub Actions

The workflow validates the same Terraform workflow used locally: init, validate and plan.
The difference is that local runs use the current AWS identity, while GitHub Actions authenticates through OIDC and assumes the github-ci-role.

<img width="700" alt="GitHub CI results" src="https://github.com/user-attachments/assets/42e54dc1-a2a6-4010-a26c-96b630c02f0d" />

## 4. Container registry

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

### Access and permissions

For now, the ECR read policy is attached manually to the CI role

| Source         | Permission / Policy       | Target                             |
| -------------- | ------------------------- | ---------------------------------- |
| github-ci-role | policy-ecr-terraform-plan | ECR repository `ecr-repo-practice` |

<img width="700" alt="GitHub CI results" src="https://github.com/user-attachments/assets/25c48510-c948-4e51-ab65-b6c9a7b25933" />

## 5. Reports storage

TODO manage an S3 bucket for generated reports/artifacts
