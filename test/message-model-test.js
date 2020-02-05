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
    it("it should add 2 emails to the database", async function() {
      //add a new user
      const addedUser = await user_model.addUser({ email: "test@gmail.com" });
      //add 2 emails to the new user
      await message_model.addEmail({
        message_id: "123",
        user_id: addedUser.id
      });
      await message_model.addEmail({
        message_id: "345",
        user_id: addedUser.id
      });
      // return all emails stored in BE and check there is only 2
      const email = await db("emails");
      expect(email).to.have.lengthOf(2);
    });
  });
});
