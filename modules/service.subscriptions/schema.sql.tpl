ALTER TABLE ${db_name}.datastores ADD subscription_id INT;

CREATE TABLE IF NOT EXISTS ${db_name}.subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_key VARCHAR(25) NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  status ENUM('pending', 'active', 'expired', 'grace_period', 'cancelled', 'terminated') NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ${db_name}.invoices (
  guid CHAR(36) NOT NULL PRIMARY KEY,
  subscription_id INT NOT NULL,
  issue_date DATETIME NOT NULL,
  due_date DATETIME NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  xch_payment_address VARCHAR(42) NOT NULL,
  status ENUM('unpaid', 'paid', 'overdue') NOT NULL,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

CREATE TABLE IF NOT EXISTS ${db_name}.payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_guid CHAR(36) NOT NULL,
  transaction_hash VARCHAR(66) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATETIME NOT NULL,
  FOREIGN KEY (invoice_guid) REFERENCES invoices(guid)
);
