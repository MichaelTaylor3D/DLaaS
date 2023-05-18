/**
 * @fileoverview This file sets up the generation and deployment of a Node.js AWS Lambda Layer 
 * using files from a 'common' directory. It ensures that the layer is updated 
 * when any changes are made to the files in the 'common' directory.
 */


resource "random_uuid" "archive" { }

data "archive_file" "lambda_layer_source" {
  type        = "zip"
  source_dir  = "${path.module}/common-layer"
  output_path = "${path.module}/common-layer-tf-handler-${random_uuid.archive.result}.zip"
}

resource "aws_lambda_layer_version" "common-layer" {
  filename           = data.archive_file.lambda_layer_source.output_path
  source_code_hash   = data.archive_file.lambda_layer_source.output_base64sha256
  layer_name         = "common-layer"

  compatible_runtimes = ["nodejs16.x"]
}