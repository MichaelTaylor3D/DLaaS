const mysql = require("mysql");

/**
 * Formats a query string with values to be escaped.
 * @function
 * @param {string} query - The SQL query with placeholders.
 * @param {Object} values - The values to be inserted in the placeholders.
 * @returns {string} - The formatted SQL query.
 */
const queryFormat = function (query, values) {
  if (!values) return query;
  return query.replace(
    /\:(\w+)/g,
    function (txt, key) {
      if (values.hasOwnProperty(key)) {
        return this.escape(values[key]);
      }
      return txt;
    }.bind(this)
  );
};

/**
 * Retrieves the saved hash for the given access key.
 * @async
 * @function
 * @param {string} accessKey - The access key to query.
 * @returns {Promise<Object>} - A promise that resolves with the user ID and access key hash.
 */
const getSaveHashForAccessKey = async (accessKey) => {
  return dbQuery(
    `SELECT user_id, access_key_hash FROM access_keys WHERE access_key = :access_key`,
    {
      accessKey,
    }
  );
};


/**
 * Upserts user metadata.
 * @async
 * @function
 * @param {number} userId - The user ID.
 * @param {string} metaKey - The metadata key.
 * @param {string} metaValue - The metadata value.
 * @returns {Promise<void>}
 */
const upsertUserMeta = async (userId, metaKey, metaValue) => {
  // Load the database configuration from file
  const dbConfig = await getConfigurationFile("db.config.json");

  // Create a new MySQL connection using the configuration
  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  // Set the custom query format function for the connection
  connection.config.queryFormat = queryFormat;

  // Return a new Promise that wraps the MySQL query
  return new Promise((resolve, reject) => {
    // Define the SQL query to insert or update user metadata
    const sql = `INSERT INTO user_meta (user_id, meta_key, meta_value) VALUES (:userId, :metaKey, :metaValue) ON DUPLICATE KEY UPDATE user_id = :userId1, meta_key = :metaKey1, meta_value = :metaValue1`;

    // Set the query parameters
    const params = {
      userId,
      metaKey,
      metaValue,
      userId1: userId,
      metaKey1: metaKey,
      metaValue1: metaValue,
    };

    // Execute the query with the specified parameters
    connection.query(sql, params, (error) => {
      // If there's an error, reject the Promise, close the connection, and return
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      // If the query is successful, close the connection and resolve the Promise
      connection.end();
      resolve();
    });
  });
};

/**
 * Retrieves user metadata.
 * @async
 * @function
 * @param {number} userId - The user ID.
 * @param {string} metaKey - The metadata key.
 * @returns {Promise<string>} - The metadata value.
 */
const getUserMeta = async (userId, metaKey) => {
  // Load the database configuration from file
  const dbConfig = await getConfigurationFile("db.config.json");

  // Create a new MySQL connection using the configuration
  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  // Set the custom query format function for the connection
  connection.config.queryFormat = queryFormat;

  // Return a new Promise that wraps the MySQL query
  return new Promise((resolve, reject) => {
    // Define the SQL query to select the metadata value for the given user and key
    const sql = `SELECT meta_value FROM user_meta WHERE user_id = :userId AND meta_key = :metaKey`;

    // Set the query parameters
    const params = {
      userId,
      metaKey,
    };

    // Execute the query with the specified parameters
    connection.query(sql, params, (error, results) => {
      // If there's an error, reject the Promise, close the connection, and return
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      // If the query is successful, close the connection and resolve the Promise with the metadata value
      connection.end();
      resolve(results?.[0]?.meta_value);
    });
  });
};

/**
 * Deletes a user's metadata entry by key.
 * @async
 * @function
 * @param {number} userId - The user ID.
 * @param {string} metaKey - The metadata key.
 * @returns {Promise<void>} Resolves when the metadata entry is deleted.
 */
const deleteUserMeta = async (userId, metaKey) => {
  // Load the database configuration from file
  const dbConfig = await getConfigurationFile("db.config.json");

  // Create a new MySQL connection using the configuration
  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  // Set the custom query format function for the connection
  connection.config.queryFormat = queryFormat;

  // Return a new Promise that wraps the MySQL query
  return new Promise((resolve, reject) => {
    // Define the SQL query to delete the metadata entry for the given user and key
    const sql = `DELETE FROM user_meta WHERE user_id = :userId AND meta_key = :metaKey`;

    // Set the query parameters
    const params = {
      userId,
      metaKey,
    };

    // Execute the query with the specified parameters
    connection.query(sql, params, (error) => {
      // If there's an error, reject the Promise, close the connection, and return
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      // If the query is successful, close the connection and resolve the Promise
      connection.end();
      resolve();
    });
  });
};

/**
 * Retrieves a user by email.
 * @async
 * @function
 * @param {string} email - The user's email.
 * @returns {Promise<Object>} - The user object.
 */
const getUserByEmail = async (email) => {
  // Load the database configuration from file
  const dbConfig = await getConfigurationFile("db.config.json");

  // Create a new MySQL connection using the configuration
  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  // Set the custom query format function for the connection
  connection.config.queryFormat = queryFormat;

  // Return a new Promise that wraps the MySQL query
  return new Promise((resolve, reject) => {
    // Define the SQL query to select a user with the specified email
    const sql = `SELECT * FROM users WHERE email = :email`;

    // Set the query parameters
    const params = { email };

    // Execute the query with the specified parameters
    connection.query(sql, params, (error, results) => {
      // If there's an error, reject the Promise, close the connection, and return
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      // If the query is successful, close the connection and resolve the Promise with the first result (the user object)
      connection.end();
      resolve(results?.[0]);
    });
  });
};

/**
 * Retrieves a user by email or username.
 * @async
 * @function
 * @param {string} email - The user's email.
 * @param {string} username - The user's username.
 * @returns {Promise<Object>} - The user object.
 */
const getUserByEmailOrUsername = async (email, username) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = queryFormat;

  return new Promise((resolve, reject) => {
    const sql = `SELECT username, email FROM users WHERE username = :username OR email = :email`;

    const params = { email, username };

    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      connection.end();
      resolve(results?.[0]);
    });
  });
};

/**
 * Retrieves a user by a specified column and value.
 * @async
 * @function
 * @param {string} column - The column to search by.
 * @param {*} value - The value to search for.
 * @returns {Promise<Object>} - The user object.
 */
const getUserBy = async (column, value) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = queryFormat;

  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM users WHERE ${column} = :value`;

    const params = { column, value };

    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      connection.end();
      resolve(results?.[0]);
    });
  });
};

/**
 * Executes a database query.
 * @async
 * @function
 * @param {string} sql - The SQL query.
 * @param {Object} params - The query parameters.
 * @returns {Promise<Array>} - The query results.
 */
const dbQuery = async (sql, params) => {
  const dbConfig = await getConfigurationFile("db.config.json");

  const connection = mysql.createConnection({
    host: dbConfig.address,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.db_name,
  });

  connection.config.queryFormat = queryFormat;

  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
        connection.end();
        return;
      }
      connection.end();
      resolve(results);
    });
  });
};

module.exports = {
  queryFormat,
  upsertUserMeta,
  getUserMeta,
  deleteUserMeta,
  getUserByEmail,
  getUserByEmailOrUsername,
  getUserBy,
  dbQuery,
  getSaveHashForAccessKey,
};
