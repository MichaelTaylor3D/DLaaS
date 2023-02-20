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
  INSERT INTO users (username, email, password_hash, salt, confirmation_code ) VALUES (username, email, passwordHash, salt, confirmationCode);
END
$$

DELIMITER $$
CREATE PROCEDURE confirm_account(
	confirmationCode VARCHAR(100)
) 
BEGIN	
  SELECT user_id INTO @userId from user_meta WHERE meta_key = 'confirmationCode' AND meta_value = confirmationCode LIMIT 1;
  UPDATE users SET confirmed = true WHERE id = @userId;
END
$$

DELIMITER $$
CREATE PROCEDURE insert_jwt(
	jwt VARCHAR(100),
  user_id VARCHAR(100),
) 
BEGIN	
  DELETE FROM users WHERE confirmed = false AND created_at < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY));
  DELETE FROM access_tokens WHERE expires_on < UNIX_TIMESTAMP(NOW());

  INSERT INTO users ( user_id, access_token, expires_on) VALUES (user_id, jwt, UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY)))
END
$$