data "archive_file" "lambda_layer_source" {
  type        = "zip"
  source_dir  = "${path.module}/lambda-npm-layer"
  output_path = "${path.module}/lambda-npm-layer/lambda-npm-layer-tf-handler-${random_uuid.archive.result}.zip"
}

resource "aws_lambda_layer_version" "npm_layer" {
  filename           = "../lambda-npm-layer/lambda-npm-layer.zip"
  source             = data.archive_file.lambda_layer_source.output_path
  source_code_hash   = data.archive_file.lambda_layer_source.output_base64sha256
  layer_name         = "npm-layer"

  compatible_runtimes = ["nodejs16.x"]
}