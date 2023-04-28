resource "aws_db_instance" "default" {
  identifier                  = "dlstorage-db"
  allocated_storage           = 20
  max_allocated_storage       = 500
  storage_type                = "gp2"
  engine                      = "mysql"
  engine_version              = "8.0.28"
  allow_major_version_upgrade = true
  apply_immediately           = true
  instance_class              = local.config.DB_INSTANCE_CLASS
  name                        = local.config.SERVICE_NAME
  username                    = random_password.username.result
  password                    = random_password.password.result
  parameter_group_name        = aws_db_parameter_group.default.name
  skip_final_snapshot         = false
  final_snapshot_identifier   = "dlstorage-db-final-snapshot"
  db_subnet_group_name        = aws_db_subnet_group.default_db_subnet_group.name
  multi_az                    = true
  vpc_security_group_ids      = [aws_security_group.allow-mysql-security-group.id]

  publicly_accessible         = true
  maintenance_window          = "Sat:10:25-Sat:15:00"
  deletion_protection         = false

  #backup settings
  backup_retention_period     = 30
  backup_window               = "09:46-10:16"
  delete_automated_backups    = false

  #s3_import {
  #  source_engine         = "mysql"
  #  source_engine_version = "5.7"
  #  bucket_name           = var.db_output_bucket_id
  #  bucket_prefix         = "backups/db"
  #  ingestion_role        = aws_iam_role.s3_import.arn
  #}
}

resource "aws_db_parameter_group" "default" {
  name   = "rds-pg"
  family = "mysql8.0"

  parameter {
    name  = "log_bin_trust_function_creators"
    value = "1"
  }
}

data "aws_iam_policy_document" "s3_import_assume" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type        = "Service"
      identifiers = ["rds.amazonaws.com", "s3.amazonaws.com"]
    }
  }
}

resource "aws_db_subnet_group" "default_db_subnet_group" {
  name       = "db_services_subnet_group"
  subnet_ids = [
    aws_subnet.public-1.id, 
    aws_subnet.public-2.id, 
    aws_subnet.public-3.id
  ]

  tags = {
    Name = "${local.config.AWS_PROFILE} DB Subnet Group"
  }
}

resource "aws_iam_role" "s3_import" {
  name                  = "db-services-s3-import-role"
  description           = "IAM role to allow RDS to import MySQL backup from S3"
  assume_role_policy    = data.aws_iam_policy_document.s3_import_assume.json
  force_detach_policies = true
}

resource "random_password" "username" {
  length           = 15
  special          = false
}

resource "random_password" "password" {
  length           = 30
  special          = false
  override_special = "_%@"
}

resource "aws_s3_bucket_object" "database-config-upload" {
  bucket       = aws_s3_bucket.storage_devops_bucket.id
  key          = "configurations/db.config.json"
  content_type = "application/json"
  content      = <<EOF
  {  
    "address": "${aws_db_instance.default.address}",
    "arn": "${aws_db_instance.default.arn}",
    "endpoint": "${aws_db_instance.default.endpoint}",
    "db_name": "${local.config.SERVICE_NAME}",
    "db_port": "${aws_db_instance.default.port}",
    "username": "${aws_db_instance.default.username}",
    "password": "${aws_db_instance.default.password}"
  }
  EOF
}

output "database_endpoint" { value = aws_db_instance.default.endpoint }