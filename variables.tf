data "external" "config_json" {
  program = ["cat", "config.json"]
}

locals {
  config = jsondecode(jsonencode(data.external.config_json.result))
}

variable "aws_access_key"         {}
variable "aws_secret_key"         {}
