CREATE TABLE IF NOT EXISTS ${db_name}.datalayer_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(300) NOT NULL,
  store_id VARCHAR(300)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE ${db_name}.datalayer_files ADD UNIQUE `unique_file_store_id_index` (filename, store_id);