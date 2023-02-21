SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `dlstorage_services` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;

USE `dlstorage_services`;

-- User Table

CREATE TABLE IF NOT EXISTS dlstorage_services.users(
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(600) NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Datastores Table

CREATE TABLE IF NOT EXISTS dlstorage_services.datastores(
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  singleton_id VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100),
  size INT
);

ALTER TABLE dlstorage_services.datastores ADD INDEX `user_index` (`user_id`);

-- User Transactions Table

CREATE TABLE IF NOT EXISTS dlstorage_services.user_transactions(
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  transaction_id VARCHAR(100) NOT NULL UNIQUE,
);

ALTER TABLE dlstorage_services.user_transactions ADD INDEX `user_index` (`user_id`);

-- User Access Tokens Table

CREATE TABLE IF NOT EXISTS dlstorage_services.access_tokens(
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  access_token INT NOT NULL,
  expires_on TIMESTAMP NOT NULL
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE dlstorage_services.access_tokens ADD INDEX `user_index` (`user_id`);

-- User Secrets Table

CREATE TABLE IF NOT EXISTS dlstorage_services.client_access_keys(
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  access_key INT NOT NULL,
  access_key_hash INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
);

ALTER TABLE dlstorage_services.client_access_keys ADD INDEX `user_index` (`user_id`);

-- meta Table

CREATE TABLE IF NOT EXISTS dlstorage_services.user_meta(
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  meta_key VARCHAR(100) NOT NULL UNIQUE,
  meta_value VARCHAR(100) NOT NULL
);

ALTER TABLE dlstorage_services.user_meta ADD INDEX `user_index` (`user_id`);

COMMIT;

