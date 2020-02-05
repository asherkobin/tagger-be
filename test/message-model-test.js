const message_model = require("../api/messages/message-model");
const user_model = require("../api/users/user-model");
const db = require("../data/dbConfig");
const chai = require("chai");

var expect = chai.expect;

describe("message_model", function() {
  beforeEach(async () => {
    await db("users").truncate();
    await db("emails").truncate();
  });

  describe("insert()", function() {
    it("it should add 2 emails to he database", async function() {
      //call insert, passing a hobbit object
      const addedUser = await user_model.addUser({ email: "test@gmail.com" });

      await message_model.addEmail({
        message_id: "123",
        user_id: addedUser.id
      });
      await message_model.addEmail({
        message_id: "345",
        user_id: addedUser.id
      });

      //check the database directly to check hobbit was added

      const email = await db("emails");
      expect(email).to.have.lengthOf(2);
    });
  });
});
