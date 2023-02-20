variable "aws_access_key"         {}
variable "aws_secret_key"         {}
variable "aws_region"             { default = "us-east-1" }
variable "aws_profile"            { default = "dlstorage_services" }
variable "default_storage_bucket" { default = "dlstorage-services" }
variable "worker_ami"             { default = "ami-049b2f0db4372c059" }
variable "service_domain"         { default = "datalayer.storage" }
