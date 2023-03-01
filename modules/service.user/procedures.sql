USE `dlstorage_services`;

DELIMITER $$
CREATE PROCEDURE create_new_user(
	username VARCHAR(100), 
	email VARCHAR(100), 
	passwordHash VARCHAR(600), 
	salt VARCHAR(100), 
	confirmationCode VARCHAR(100)
) 
BEGIN		
  START TRANSACTION;

  DELETE FROM users WHERE confirmed = false AND created_at < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY));
  INSERT INTO users (username, email, password_hash) VALUES (username, email, passwordHash);

	
  SELECT LAST_INSERT_ID() INTO @id;

  INSERT INTO user_meta (user_id, meta_key, meta_value) VALUES (@id, 'salt', salt) ON DUPLICATE KEY UPDATE user_id = @id, meta_key = 'salt', meta_value = salt;
  INSERT INTO user_meta (user_id, meta_key, meta_value) VALUES (@id, 'confirmationCode', confirmationCode) ON DUPLICATE KEY UPDATE user_id = @id, meta_key = 'confirmationCode', meta_value = confirmationCode;

  COMMIT WORK;
END
$$

DELIMITER $$
CREATE PROCEDURE confirm_account(
	confirmationCode VARCHAR(100)
) 
BEGIN	
	UPDATE users 
	SET users.confirmed = true 
	FROM users
	INNER JOIN user_meta 
				ON user_meta.user_id = users.id 
	WHERE user_meta.meta_key = 'confirmationCode' 
		AND user_meta.meta_value = confirmationCode;
END
$$
