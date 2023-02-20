USE `dlstorage_services`;

DELIMITER $$
CREATE PROCEDURE create_new_user(
	username VARCHAR(100), 
	email VARCHAR(100), 
	passwordHash VARCHAR(200), 
	salt VARCHAR(100), 
	confirmationCode VARCHAR(100)
) 
BEGIN
  DECLARE errno INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
  GET CURRENT DIAGNOSTICS CONDITION 1 errno = MYSQL_ERRNO;
  SELECT errno AS MYSQL_ERROR;
  ROLLBACK;
  END;

  START TRANSACTION;
	
  DELETE FROM users WHERE confirmed = false AND created_at < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY));
  INSERT INTO users (username, email, password_hash) VALUES (username, email, passwordHash);

  INSERT INTO user_meta (user_id, meta_key, meta_value) VALUES (LAST_INSERT_ID(), 'salt', salt);
  INSERT INTO user_meta (user_id, meta_key, meta_value) VALUES (LAST_INSERT_ID(), 'confirmationCode', confirmationCode);

  COMMIT WORK;
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
CREATE PROCEDURE confirm_account(
	confirmationCode VARCHAR(100)
) 
BEGIN	
  SELECT user_id INTO @userId from user_meta WHERE meta_key = 'confirmationCode' AND meta_value = confirmationCode LIMIT 1;
  UPDATE users SET confirmed = true WHERE id = @userId;
END
$$