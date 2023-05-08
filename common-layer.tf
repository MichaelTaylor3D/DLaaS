resource "random_uuid" "archive" { }

data "archive_file" "lambda_layer_source" {
  type        = "zip"
  source_dir  = "${path.module}/common"
  output_path = "${path.module}/common/common-layer-tf-handler-${random_uuid.archive.result}.zip"
}

resource "aws_lambda_layer_version" "npm_layer" {
  filename           = data.archive_file.lambda_layer_source.output_path
  source_code_hash   = data.archive_file.lambda_layer_source.output_base64sha256
  layer_name         = "common-layer"

  compatible_runtimes = ["nodejs16.x"]
}