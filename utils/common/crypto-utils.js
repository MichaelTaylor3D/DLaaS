const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Verifies a JWT token.
 * @async
 * @function
 * @param {string} token - The JWT token to verify.
 * @returns {Promise<Object>} - A promise that resolves with the decoded token payload.
 * @throws {Error} If the token verification fails.
 */
const verifyToken = async (token) => {
  const config = await getConfigurationFile("crypto.config.json");
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.token_secret, (err, decoded) => {
      if (err) {
        reject(err);
      }

      resolve(decoded);
    });
  });
};

/**
 * Hashes a string with a salt using the PBKDF2 algorithm.
 * @async
 * @function
 * @param {string} str - The string to hash.
 * @param {string} salt - The salt to use for hashing.
 * @returns {Promise<Object>} - A promise that resolves with an object containing the original string and the hashed result.
 * @throws {Error} If the hashing process fails.
 */
const hashWithSalt = async (str, salt) => {
  const pbkdf2 = await getConfigurationFile("crypto.config.json");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      `${pbkdf2.static_salt}-${str}`,
      salt,
      pbkdf2.iterations,
      pbkdf2.password_length,
      pbkdf2.digest,
      (error, hash) => {
        if (error) {
          return reject(error);
        }

        resolve({
          str,
          hash: hash.toString(pbkdf2.byte_to_string_encoding),
        });
      }
    );
  });
};

/**
 * Generates a random salt for hashing.
 * @async
 * @function
 * @returns {Promise<string>} - A promise that resolves with the generated salt.
 */
const generateSalt = async () => {
  const pbkdf2 = await getConfigurationFile("crypto.config.json");

  return crypto
    .randomBytes(pbkdf2.dynamic_salt_length)
    .toString(pbkdf2.byte_to_string_encoding);
};

/**
 * Generates a random confirmation code.
 * @function
 * @returns {string} - The generated confirmation code.
 */
const generateConfirmationCode = () => {
  return crypto.randomBytes(25).toString("hex");
};

module.exports = {
  verifyToken,
  hashWithSalt,
  generateSalt,
  generateConfirmationCode,
};
