/**
 * @fileoverview This file sets up the generation and deployment of a Node.js AWS Lambda Layer 
 * using files from a 'common' directory. It ensures that the layer is updated 
 * when any changes are made to the files in the 'common' directory.
 */


resource "random_uuid" "archive" { }

data "local_file" "common_files" {
  for_each = fileset("${path.module}/common", "*")

  filename = "${path.module}/common/${each.value}"
}

locals {
  common_files_sha256 = sha256(join("", [for f in data.local_file.common_files : f.content_base64]))
}

resource "null_resource" "copy_common_files_to_layer" {
  provisioner "local-exec" {
    command = <<EOF
      mkdir -p ${path.module}/common-layer/nodejs/common && \
      cp -R ${path.module}/common/* ${path.module}/common-layer/nodejs/common && \
      cp -R ${path.module}/common/node_modules ${path.module}/common-layer/nodejs && \
      rm -rf ${path.module}/common-layer/nodejs/common/node_modules && \
      touch ${path.module}/complete.txt
    EOF
  }

  triggers = {
    rebuild_trigger = local.common_files_sha256
  }

  depends_on = [
    data.local_file.common_files,
  ]
}

resource "null_resource" "wait_for_file" {
  provisioner "local-exec" {
    command = <<EOF
      until [ -f ${path.module}/complete.txt ]
      do
        sleep 1
      done
    EOF
  }

  triggers = {
    rebuild_trigger = local.common_files_sha256
  }
}

data "archive_file" "lambda_layer_source" {
  type        = "zip"
  source_dir  = "${path.module}/common-layer"
  output_path = "${path.module}/common-layer-tf-handler-${random_uuid.archive.result}.zip"

 depends_on = [
    null_resource.wait_for_file
  ]
}

resource "aws_lambda_layer_version" "common_layer" {
  filename           = data.archive_file.lambda_layer_source.output_path
  source_code_hash   = data.archive_file.lambda_layer_source.output_base64sha256
  layer_name         = "common-layer"

  compatible_runtimes = ["nodejs16.x"]
}