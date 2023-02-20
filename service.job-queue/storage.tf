
# Reserve a private folder where the job files can be uploaded to
resource "aws_s3_bucket_object" "job-folder" {
  bucket = var.storage_bucket_id
  acl    = "private"
  key    = "service.jobs/"
  source = "/dev/null"
}

resource "aws_s3_bucket_object" "results-folder" {
  bucket = var.storage_bucket_id
  acl    = "private"
  key    = "public/service.user_assets/"
  source = "/dev/null"
}

output job-folder     { value = aws_s3_bucket_object.job-folder.key }
output results-folder { value = aws_s3_bucket_object.results-folder.key}