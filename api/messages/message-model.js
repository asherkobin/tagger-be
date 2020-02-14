const db = require("../../data/dbConfig.js");

module.exports = {
  getHeadersFromEmailById,
  getLastEmailFromUser,
  getEmailIds,
  getEmailsForDS,
  addEmail,
  deleteAllEmailsByUser,
  deleteEmail,
  getTagsForMessage,
  getMessageTagsFromUser,
  get,
  findEmailbyId,
  emails
};

function getEmailsForDS(userId) {
  return db("emails")
    .select("uid", "from as from", "email_body_text as msg", "subject")
    .where("user_id", id);
}

function emails(id) {
  return db("emails").where("user_id", id);
}

function deleteEmail(uid) {
  return db("emails")
    .where("uid", uid)
    .del();
}

function getHeadersFromEmailById(id) {
  return db("emails")
    .select("from", "name", "to", "subject", "uid")
    .where("user_id", id);
}

function getLastEmailFromUser(userid) {
  return db("emails")
    .orderby("uid", "desc")
    .where("user_id", userid)
    .first();
}

function findEmailbyId(id) {
  return db("emails")
    .where({ id })
    .first();
}
function addEmail(email) {
  // const [id] = await db("emails").insert(email, "id");

  // return findEmailbyId(id);
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
