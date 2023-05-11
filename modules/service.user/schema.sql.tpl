-- User Table

CREATE TABLE IF NOT EXISTS ${db_name}.users(
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(600) NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- User Access Tokens Table

CREATE TABLE IF NOT EXISTS ${db_name}.access_tokens(
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  access_token INT NOT NULL,
  expires_on TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE ${db_name}.access_tokens ADD INDEX `user_index` (`user_id`);

-- User Secrets Table

CREATE TABLE IF NOT EXISTS ${db_name}.client_access_keys(
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  access_key VARCHAR(20) NOT NULL,
  access_key_hash VARCHAR(40) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE ${db_name}.client_access_keys ADD INDEX `user_index` (`user_id`);

-- meta Table

CREATE TABLE IF NOT EXISTS ${db_name}.user_meta(
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  meta_key VARCHAR(100) NOT NULL,
  meta_value VARCHAR(100) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE ${db_name}.user_meta ADD UNIQUE `unique_user_meta_index` (user_id, meta_key);
ALTER TABLE ${db_name}.user_meta ADD INDEX `user_index` (`user_id`);