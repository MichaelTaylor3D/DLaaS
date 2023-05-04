CREATE DATABASE IF NOT EXISTS `${db_name}` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;

-- Datastores Table

CREATE TABLE IF NOT EXISTS ${db_name}.datastores(
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  singleton_id VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100),
  size INT
);

ALTER TABLE ${db_name}.datastores ADD INDEX `user_index` (`user_id`);

-- Mirrors Table

CREATE TABLE IF NOT EXISTS ${db_name}.user_mirrors(
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  singleton_id VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100),
  active BOOLEAN DEFAULT false
);

ALTER TABLE ${db_name}.user_mirrors ADD INDEX `user_index` (`user_id`);
ALTER TABLE ${db_name}.user_mirrors ADD INDEX `active_index` (`user_id`, `active`);
ALTER TABLE ${db_name}.user_mirrors ADD UNIQUE `unique_user_meta_index` (user_id, singleton_id);

-- User Transactions Table

CREATE TABLE IF NOT EXISTS ${db_name}.user_transactions(
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  transaction_id VARCHAR(100) NOT NULL UNIQUE
);

ALTER TABLE ${db_name}.user_transactions ADD INDEX `user_index` (`user_id`);
