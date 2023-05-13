CREATE TABLE IF NOT EXISTS ${db_name}.subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_key VARCHAR(25) NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  status ENUM('pending', 'active', 'expired', 'grace_period', 'cancelled', 'terminated') NOT NULL,
  data JSON
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ${db_name}.invoices (
  guid CHAR(36) NOT NULL PRIMARY KEY,
  subscription_id INT NOT NULL,
  issue_date DATETIME NOT NULL,
  due_date DATETIME NOT NULL,
  total_amount_due DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  xch_payment_address VARCHAR(62) NOT NULL,
  status ENUM('unpaid', 'paid', 'overdue', 'expired') NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ${db_name}.payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_guid CHAR(36) NOT NULL,
  coin_name VARCHAR(66) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  confirmed_at_height VARCHAR(100) NOT NULL,
  fee VARCHAR(300) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE ${db_name}.payments ADD UNIQUE `unique_payment` (invoice_guid, coin_name, confirmed_at_height);

-- Mirrors Table

CREATE TABLE IF NOT EXISTS ${db_name}.user_mirrors(
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  singleton_id VARCHAR(100) NOT NULL,
  name VARCHAR(100),
  active BOOLEAN DEFAULT false,
  subscription_id INT,
  salt VARCHAR(24),
  permissioned_for JSON
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE ${db_name}.user_mirrors ADD INDEX `user_index` (`user_id`);
ALTER TABLE ${db_name}.user_mirrors ADD INDEX `active_index` (`user_id`, `active`);
ALTER TABLE ${db_name}.user_mirrors ADD UNIQUE `unique_user_singleton_id_index` (user_id, singleton_id);

