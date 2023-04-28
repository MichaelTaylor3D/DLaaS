#provider "mysql" {
#  endpoint = aws_db_instance.default.endpoint
#  username = random_password.username.result
#  password = random_password.password.result
#}

#resource "mysql_database" "application-db" {
#  name = var.service_name
#}