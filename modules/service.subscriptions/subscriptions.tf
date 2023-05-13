resource "aws_s3_bucket_object" "products_json_upload" {
  bucket       = var.dev_bucket_id
  key          = "configurations/products.config.json"
  content_type = "application/json"
  source = "${path.module}/products.json"
  etag = filemd5("${path.module}/products.json")
}