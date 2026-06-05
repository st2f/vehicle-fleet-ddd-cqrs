provider "aws" {
  region = "eu-north-1"

  default_tags {
    tags = {
      Project     = "ci-practice"
      ManagedBy   = "terraform"
      Environment = "lab"
      Owner       = "stephanie"
    }
  }
}