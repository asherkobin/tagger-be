const db = require("../../data/dbConfig.js");

module.exports = {
  getEmailIds,
  addEmail,
  deleteAllEmailsByUser,
  getTagsForMessage,
  getMessageTagsFromUser,
  get,
  findEmailbyId
};
function findEmailbyId(id) {
  return db("emails")
    .where({ id })
    .first();
}
async function addEmail(email) {
  const [id] = await db("emails").insert(email, "id");

  return findEmailbyId(id);
  // return db("emails")
  //   .insert(email, "id")
  //   .then(ids => {
  //     return ids;
  //   });
}

function getEmailIds(userId) {
  return db("emails")
    .select("id")
    .where("user_id", userId);
}

function deleteAllEmailsByUser(userId) {
  return db("emails")
    .where("user_id", userId)
    .del();
}

function getTagsForMessage(messageId) {
  return db("tags")
    .select("tags")
    .where("message_id", messageId);
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
