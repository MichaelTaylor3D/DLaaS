CREATE PROCEDURE ${db_name}.create_new_user(
  IN p_username VARCHAR(100), 
  IN p_email VARCHAR(100), 
  IN p_passwordHash VARCHAR(600), 
  IN p_salt VARCHAR(100), 
  IN p_confirmationCode VARCHAR(100)
) 
BEGIN		
  START TRANSACTION;

  DELETE FROM users WHERE confirmed = false AND created_at < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY));
  INSERT INTO users (username, email, password_hash) VALUES (p_username, p_email, p_passwordHash);

	
  SELECT LAST_INSERT_ID() INTO @id;

  INSERT INTO user_meta (user_id, meta_key, meta_value) VALUES (@id, 'salt', p_salt) ON DUPLICATE KEY UPDATE meta_value = p_salt;
  INSERT INTO user_meta (user_id, meta_key, meta_value) VALUES (@id, 'confirmationCode', p_confirmationCode) ON DUPLICATE KEY UPDATE meta_value = p_confirmationCode;

  COMMIT WORK;
END;

CREATE PROCEDURE ${db_name}.confirm_account(
  IN confirmationCode VARCHAR(100)
) 
BEGIN	
  UPDATE users 
  INNER JOIN user_meta 
  ON user_meta.user_id = users.id 
  SET users.confirmed = true 
  WHERE user_meta.meta_key = 'confirmationCode' 
  AND user_meta.meta_value = confirmationCode;
END;