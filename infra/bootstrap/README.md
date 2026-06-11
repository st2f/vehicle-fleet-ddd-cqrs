# Bootstrap infrastructure

This folder contains Terraform for CI/operator permissions that must exist
before GitHub Actions can reliably run `terraform plan`.

## 1. AWS bootstrap

This is the infrastructure foundation Terraform depends on:

- Terraform remote state stores the shared infrastructure state in S3 instead
  of only on one local machine.
- S3 lockfile support prevents two Terraform runs from changing the same state
  at the same time (backend.tf / `use_lockfile = true`).
- The GitHub OIDC provider lets GitHub Actions request temporary AWS credentials
  without storing an AWS access key in GitHub.
- The IAM role defines what GitHub Actions is allowed to do after it authenticates.

### Resources

| Type           | Name                                 | Managed by        | Purpose                                        |
| -------------- | ------------------------------------ | ----------------- | ---------------------------------------------- |
| OIDC Provider  | token.actions.githubusercontent.com  | Manual bootstrap  | GitHub identity provider                       |
| IAM Role       | github-ci-role                       | Manual bootstrap  | Role assumed by GitHub Actions                 |
| S3 Bucket      | terraform-state-stef                 | Manual bootstrap  | Terraform remote state                         |
| IAM Policy     | policy-github-ci-terraform-plan-read | `infra/bootstrap` | Let CI refresh resources during Terraform plan |
| IAM Attachment | github-ci-role / plan-read policy    | `infra/bootstrap` | Attach Terraform plan read access to CI        |

### Access and permissions

| Source                       | Permission / Policy                  | Target                                             |
| ---------------------------- | ------------------------------------ | -------------------------------------------------- |
| GitHub Actions (`repo-name`) | AssumeRoleWithWebIdentity            | github-ci-role                                     |
| github-ci-role               | policy-s3-terraform-state            | terraform-state-stef                               |
| github-ci-role               | policy-github-ci-terraform-plan-read | S3/ECR/SSM/IAM resources refreshed by `infra` plan |

CI does not run this folder. Apply it locally with an admin AWS identity:

```sh
cd infra/bootstrap
terraform init
terraform validate
terraform plan
terraform apply
```
