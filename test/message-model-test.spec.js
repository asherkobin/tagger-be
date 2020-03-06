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
      const addedUser = await user_model.addUser({ email: "Billy@gmail.com" });
      //add 2 emails to the new user
      await message_model.addEmail({
        message_id: "1",
        user_id: addedUser.id,
        uid: 1
      });
      await message_model.addEmail({
        message_id: "2",
        user_id: addedUser.id,
        uid: 2
      });
      // return all emails stored in BE and check there is only 2
      const email = await db("emails");
      expect(email).to.have.lengthOf(2);
    });
  });

  describe("getResults", function(){
    it("should return specific emails from user", async function() {
      // Adds a new user
      const addUser1 = await user_model.addUser({ email: "Sally@gmail.com" })
      // Adding Emails to User
      await message_model.addEmail({
        message_id: "3",
        user_id: addUser1.id
      });
      await message_model.addEmail({
        message_id: "4",
        user_id: addUser1.id
      });
      await message_model.addEmail({
        message_id: "5",
        user_id: addUser1.id
      });
      await message_model.addEmail({
        message_id: "6",
        user_id: addUser1.id
      });
      // Getting specified results from Database
      const getRes = await message_model.getResults(addUser1.id, [3,4,6])

      expect(getRes).to.have.lengthOf(3)
    })
  })

  describe("getLastEmailFromUser", function(){
    it("should always grab the last email from user", async function(){
      // Looks for an User
      const user = await user_model.findUser("Billy@gmail.com")
      // Checks currently Last Email in DB
      const lastEmail = await message_model.getLastEmailFromUser(user.id)
  
      expect(lastEmail.message_id).to.equal('2')

      // Adding more emails
      await message_model.addEmail({
        message_id: "Billy-3",
        user_id: user.id,
        uid: 3
      });
      await message_model.addEmail({
        message_id: "Billy-4",
        user_id: user.id,
        uid: 4
      });
      await message_model.addEmail({
        message_id: "Billy-5",
        user_id: user.id,
        uid: 5
      });
      await message_model.addEmail({
        message_id: "Billy-6",
        user_id: user.id,
        uid: 6
      });

      // Checking new Last Email
      const newLastEmail = await message_model.getLastEmailFromUser(user.id)

      expect(newLastEmail.message_id).to.equal("Billy-6")
    })
  })

  describe("deleteEmail", function(){
    it("should delete an email", async function(){
      const user = await user_model.findUser("Sally@gmail.com")
      const getEmail = await message_model.emails(user.id)

      expect(getEmail).to.have.lengthOf(4)

      await message_model.deleteEmail(user.id, 6)
      const getEmailAfter = await message_model.emails(user.id)
      expect(getEmailAfter).to.have.lengthOf(3)
    })
  })

  describe("Email Flow", function() {
    it("should retrieve all emails by a given userId", async function() {
      const addedUser = await user_model.addUser({
        email: "Timmy@gmail.com"
      });
      //there should be no emails for this new user now add 3 and expect length of emails returned to be 3
      await message_model.addEmail([
        { message_id: "11", user_id: addedUser.id },
        { message_id: "12", user_id: addedUser.id },
        { message_id: "13", user_id: addedUser.id }
      ]);

      const oldUser = await user_model.findUser("Billy@gmail.com");

      const allEmailsClient0 = await message_model.getEmailIds(oldUser.id);
      const allEmailsClient1 = await message_model.getEmailIds(addedUser.id);

      expect(allEmailsClient1).to.have.lengthOf(3);
      expect(allEmailsClient0).to.have.lengthOf(6);
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
      const client0 = await user_model.findUser("Billy@gmail.com");
      const client1 = await user_model.findUser("Timmy@gmail.com");

      const allEmailsClient0 = await message_model.getEmailIds(client0.id);
      const allEmailsClient1 = await message_model.getEmailIds(client1.id);

      expect(allEmailsClient0).to.have.lengthOf(6);
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
