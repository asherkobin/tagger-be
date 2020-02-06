const message_model = require("../api/messages/message-model");
const user_model = require("../api/users/user-model");
const tag_model = require("../api/tags/tag-model");
const db = require("../data/dbConfig");
const chai = require("chai");

var expect = chai.expect;

describe("message_model", function() {
  before(async () => {
    await db("users").truncate();
    await db("emails").truncate();
    await db("tags").truncate();
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

    it("test adding a tag and get all tags by email id#", async function() {
      const tags = await message_model.getTagsForMessage(13);
      expect(tags).to.have.lengthOf(0);

      await tag_model.addTag({ tag: "productivity", email_id: 13 });
      await tag_model.addTag({ tag: "other", email_id: 13 });

      const checkForNewTag = await message_model.getTagsForMessage(13);
      // console.log(checkForNewTag, "\n\n\n****check for new tag");
      expect(checkForNewTag).to.have.lengthOf(2);
    });

    it("should delete all emails of a given user", async function() {
      const client0 = await user_model.findUser("test0@gmail.com");
      const client1 = await user_model.findUser("test1@gmail.com");

      const allEmailsClient0 = await message_model.getEmailIds(client0.id);
      const allEmailsClient1 = await message_model.getEmailIds(client1.id);

      expect(allEmailsClient0).to.have.lengthOf(2);
      expect(allEmailsClient1).to.have.lengthOf(3);

      await message_model.deleteAllEmailsByUser(client0.id);
      await message_model.deleteAllEmailsByUser(client1.id);
      const recheckAllEmailsClient0 = await message_model.getEmailIds(
        client0.id
      );
      const recheckAllEmailsClient1 = await message_model.getEmailIds(
        client1.id
      );
      // console.log(recheckAllEmailsClient0);
      expect(recheckAllEmailsClient0).to.have.lengthOf(0);
      expect(recheckAllEmailsClient1).to.have.lengthOf(0);
    });
  });
});
