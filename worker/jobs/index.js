module.exports = {
  ...require("./get_new_payment_address"),
  ...require("./get_transactions"),
  ...require("./create_mirror"),
  ...require("./upload_file_to_s3"),
  ...require("./upload_store_data_to_s3")
}