terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.49"
    }
  }
}

provider "aws" {
  region = "eu-north-1"

  default_tags {
    tags = {
      Project     = "ci-practice"
      ManagedBy   = "terraform"
      Environment = "lab"
      Owner       = "st2f"
      Stack       = "bootstrap"
    }
  }
}
