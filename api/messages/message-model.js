const db = require("../../data/dbConfig.js");
module.exports = {
  getEmailList,
  getEmail,
  getThreadList,
  getResults,
  getLastEmailFromUser,
  getEmailIds,
  searchByAny,
  addEmail,
  deleteAllEmailsByUser,
  updateEmail,
  deleteEmail,
  getTagsForMessage,
  getMessageTagsFromUser,
  get,
  findEmailbyId,
  emails,
  getLastMessageIdByUserId
};

function getLastMessageIdByUserId(userId) {
  return db("emails").max("uid").limit(10000);
}

function getEmailList(query, label) {
  return db("emails")
      .limit(query.limit)
      .offset(query.skip)
      .orderBy('date', "desc")
      .where('labels', 'ilike', `%${label}%`)
      .select('id', 'name',
          'subject', 'date', 'email_body_text')

}

function getEmail(id) {
  return db('emails')
      .orderBy('date', "desc")
      .where('id', id)
}

function getThreadList(threadID) {
  return db('emails')
      .orderBy('date', "desc")
      .where('gmThreadID', threadID)
}

function searchByAny(keyword) {
  return db('emails')
      .where( '*', 'ilike', `%${keyword}%`)
      .select('id', 'name',
          'subject', 'date', 'email_body_text')
      .orderBy('date', "desc")
}
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
