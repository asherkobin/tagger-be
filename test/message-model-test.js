const message_model = require("../api/messages/message-model");
const user_model = require("../api/users/user-model");
const db = require("../data/dbConfig");
const chai = require("chai");

var expect = chai.expect;

describe("message_model", function() {
  before(async () => {
    await db("users").truncate();
    await db("emails").truncate();
  });

  describe("addEmail", function() {
    it("it should add 2 emails to the database", async function() {
      //add a new user
      const addedUser = await user_model.addUser({ email: "test0@gmail.com" });
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

  describe("Email Flow", function() {
    it("should retrieve all emails by a given userId", async function() {
      const addedUser = await user_model.addUser({
        email: "test1@gmail.com"
      });
      //there should be no emails for this new user now add 3 and expect length of emails returned to be 3
      await message_model.addEmail([
        { message_id: "11", user_id: addedUser.id },
        { message_id: "12", user_id: addedUser.id },
        { message_id: "13", user_id: addedUser.id }
      ]);

      const oldUser = await user_model.findUser("test0@gmail.com");

      const allEmailsClient0 = await message_model.getEmailIds(oldUser.id);
      const allEmailsClient1 = await message_model.getEmailIds(addedUser.id);

      expect(allEmailsClient1).to.have.lengthOf(3);
      expect(allEmailsClient0).to.have.lengthOf(2);
    });

    // it("should");
  });
});
