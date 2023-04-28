const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const sinon = require("sinon");
const { expect } = require("chai");

const {
  verifyToken,
  hashWithSalt,
  generateSalt,
  generateConfirmationCode,
} = require("./crypto-utils");

describe("Crypto Utils", () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("verifyToken", () => {
    it("should throw an error if the token is invalid", async () => {
      const invalidToken = "invalid.token";

      try {
        await verifyToken(invalidToken);
        expect.fail("Error not thrown");
      } catch (error) {
        expect(error).to.be.an.instanceOf(jwt.JsonWebTokenError);
      }
    });
  });

  describe("hashWithSalt", () => {
    it("should return the hashed string with the original string", async () => {
      const str = "password";
      const salt = "salt";
      const pbkdf2Stub = sinon
        .stub(crypto, "pbkdf2")
        .callsArgWith(5, null, Buffer.alloc(64));

      const result = await hashWithSalt(str, salt);

      expect(result).to.deep.equal({
        str,
        hash: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
      });

      pbkdf2Stub.restore();
    });

    it("should throw an error if hashing fails", async () => {
      const str = "password";
      const salt = "salt";
      const pbkdf2Stub = sinon
        .stub(crypto, "pbkdf2")
        .callsArgWith(5, new Error("Hashing failed"));

      try {
        await hashWithSalt(str, salt);
        expect.fail("Error not thrown");
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal("Hashing failed");
      }

      pbkdf2Stub.restore();
    });
  });

  describe("generateSalt", () => {
    it("should return a generated salt", async () => {
      const randomBytesStub = sinon
        .stub(crypto, "randomBytes")
        .returns(Buffer.from("random_salt"));

      const salt = await generateSalt();

      expect(salt).to.equal("cmFuZG9tX3NhbHQ=");

      randomBytesStub.restore();
    });
  });

  describe("generateConfirmationCode", () => {
    it("should return a generated confirmation code", () => {
      const confirmationCode = generateConfirmationCode();

      expect(confirmationCode).to.have.lengthOf(50);
    });
  });
});
