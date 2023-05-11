CREATE TABLE IF NOT EXISTS ${db_name}.datalayer_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(300) NOT NULL,
  store_id INT,
);
