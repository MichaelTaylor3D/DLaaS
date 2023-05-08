#!/bin/sh

# Install required packages
sudo apt-get update
sudo apt-get install -y s3fs

# Set your AWS credentials
echo "YOUR_AWS_ACCESS_KEY:YOUR_AWS_SECRET_KEY" > ~/.passwd-s3fs
chmod 600 ~/.passwd-s3fs

# Create a local mount point directory
LOCAL_DIR="/mnt/s3-bucket"
sudo mkdir -p ${LOCAL_DIR}

# Mount the S3 bucket to the local directory
BUCKET_NAME="your-s3-bucket-name"
s3fs ${BUCKET_NAME} ${LOCAL_DIR} -o use_cache=/tmp -o allow_other -o uid=1000 -o mp_umask=002 -o multireq_max=5 -o use_path_request_style -o url=https://s3.amazonaws.com

# To unmount the S3 bucket, you can use the following command:
# fusermount -u ${LOCAL_DIR}
