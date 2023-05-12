/**
 * @fileoverview This Terraform file sets up the network infrastructure for an AWS-based application. It creates a VPC,
 * public and private subnets, an Internet gateway, route tables, route table associations, and security groups.
 *
 * The main components of this file include:
 * 1. AWS VPC: Creates the main Virtual Private Cloud (VPC) for the application.
 * 2. AWS Subnets: Configures public and private subnets in different availability zones within the VPC.
 * 3. AWS Internet Gateway: Sets up an Internet gateway and attaches it to the VPC.
 * 4. AWS Route Tables: Creates a route table for public subnets with a route to the Internet gateway.
 * 5. AWS Route Table Associations: Associates the public subnets with the public route table.
 * 6. AWS Security Groups: Defines security groups for different services (RDP, Elasticsearch, MySQL, HTTP, and SSH),
 *    allowing specific ingress traffic and all egress traffic.
 */


resource "aws_vpc" "main-services-vpc" {
  cidr_block           = "10.0.0.0/16"
  instance_tenancy     = "default"
  enable_dns_support   = "true"
  enable_dns_hostnames = "true"
  enable_classiclink   = "false"

  tags = {
    Name = "${local.config.AWS_PROFILE} Main VPC"
  }
}

# Public Subnets
resource "aws_subnet" "public-1" {
  vpc_id                  = aws_vpc.main-services-vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = "true"
  availability_zone       = "us-east-1a"
}

resource "aws_subnet" "public-2" {
  vpc_id                  = aws_vpc.main-services-vpc.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = "true"
  availability_zone       = "us-east-1b"
}

resource "aws_subnet" "public-3" {
  vpc_id                  = aws_vpc.main-services-vpc.id
  cidr_block              = "10.0.3.0/24"
  map_public_ip_on_launch = "true"
  availability_zone       = "us-east-1c"
}

# Private Subnets
resource "aws_subnet" "private-1" {
  vpc_id                  = aws_vpc.main-services-vpc.id
  cidr_block              = "10.0.4.0/24"
  map_public_ip_on_launch = "false"
  availability_zone       = "us-east-1a"
}

resource "aws_subnet" "private-2" {
  vpc_id                  = aws_vpc.main-services-vpc.id
  cidr_block              = "10.0.5.0/24"
  map_public_ip_on_launch = "false"
  availability_zone       = "us-east-1b"
}

resource "aws_subnet" "private-3" {
  vpc_id                  = aws_vpc.main-services-vpc.id
  cidr_block              = "10.0.6.0/24"
  map_public_ip_on_launch = "false"
  availability_zone       = "us-east-1c"
}

# Internet Gateway
resource "aws_internet_gateway" "default-internet-gateway" {
  vpc_id       = aws_vpc.main-services-vpc.id
}

# Route Tables
resource "aws_route_table" "public-route-table" {
  vpc_id       = aws_vpc.main-services-vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.default-internet-gateway.id
  }
}

# Route Associacions for Public IPs
resource "aws_route_table_association" "main-public-1-a" {
  subnet_id      = aws_subnet.public-1.id
  route_table_id = aws_route_table.public-route-table.id
}

resource "aws_route_table_association" "main-public-2-a" {
  subnet_id      = aws_subnet.public-2.id
  route_table_id = aws_route_table.public-route-table.id
}

resource "aws_route_table_association" "main-public-3-a" {
  subnet_id      = aws_subnet.public-3.id
  route_table_id = aws_route_table.public-route-table.id
}

resource "aws_security_group" "allow-rdp-security-group" {
  vpc_id         = aws_vpc.main-services-vpc.id
  name           = "allow-rdp-security-group"
  description    = "security group that allows rdp and all egress traffic"

  egress {
    from_port    = 0
    to_port      = 0
    protocol     = "-1"
    cidr_blocks  = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3389
    to_port     = 3389
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "allow-elastic-search-security-group" {
  vpc_id        = aws_vpc.main-services-vpc.id
  name          = "allow-elastic-search-security-group"
  description   = "security group that allows elastic-search and all egress traffic"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 9200
    to_port     = 9200
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "allow-mysql-security-group" {
  vpc_id        = aws_vpc.main-services-vpc.id
  name          = "allow-mysql-security-group"
  description   = "security group that allows mysql and all egress traffic"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "allow-html-security-group" {
  vpc_id        = aws_vpc.main-services-vpc.id
  name          = "allow-html-security-group"
  description   = "security group that allows html and all egress traffic"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "allow-ssh-security-group" {
  vpc_id        = aws_vpc.main-services-vpc.id
  name          = "allow-ssh-security-group"
  description   = "security group that allows ssh and all egress traffic"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}