const db = require("../../data/dbConfig.js");

module.exports = {
  getResults,
  getLastEmailFromUser,
  getEmailIds,
  addEmail,
  deleteAllEmailsByUser,
  updateEmail,
  deleteEmail,
  getTagsForMessage,
  getMessageTagsFromUser,
  get,
  findEmailbyId,
  emails
};

function getResults(userId, results) {
  // const numArray = results.map(num => {
  //   return num * 1;
  // });

  return db("emails")
    .whereIn("message_id", results)
    .andWhere("user_id", userId);
}

function emails(id) {
  return db("emails")
    .orderBy("date", "desc")
    .where("user_id", id);
}

function updateEmail(userId, uid, changes) {
  return db("emails")
    .where("user_id", userId)
    .andWhere("uid", uid)
    .update(changes);
}

function deleteEmail(uid) {
  return db("emails")
    .where("uid", uid)
    .del();
}

function getLastEmailFromUser(userid) {
  return db("emails")
    .orderBy("uid", "desc")
    .where("user_id", userid)
    .first();
}

function findEmailbyId(id) {
  return db("emails")
    .where({ id })
    .first();
}

function addEmail(email) {
  return db("emails")
    .insert(email, "id")
    .then(ids => {
      const [id] = ids;

      return findEmailbyId(id);
    });
}

function getEmailIds(userId) {
  return db("emails")
    .select("uid")
    .where("user_id", userId);
}

function deleteAllEmailsByUser(userId) {
  return db("emails")
    .where("user_id", userId)
    .del();
}

function getTagsForMessage(messageId) {
  return db("tags")
    .select("tag")
    .where("email_id", messageId);
}

function getMessageTagsFromUser(userId) {
  const messages = db("messages").where({ userid });

  const newMessageArray = messages.map(message => {
    return get(message.id);
  });
  return newMessageArray;
}

function get(messageId) {
  const messages = db("messages");

  if (messageId) {
    messages.where({ messageId }).first();

    const promises = [messages, getTagsForMessage(messageId)];

    return Promise.all(promises).then(results => {
      const [message, tags] = results;

      if (message) {
        message.tags = tags;

        return message;
      } else {
        return null;
      }
    });
  }
  return messages;
}
