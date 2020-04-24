const db = require("../../data/dbConfig.js");
module.exports = {
  getEmailList,
  getEmail,
  getThreadList,
  getThreadID,
  getResults,
  getLastEmailFromUser,
  getEmailIds,
  searchByAny,
  searchByCount,
  searchAll,
  getSent,
  getReceived,
  getNameFromAddress,
  addEmail,
  deleteAllEmailsByUser,
  updateEmail,
  deleteEmail,
  getTagsForMessage,
  getMessageTagsFromUser,
  get,
  findEmailbyId,
  emails,
  getLastMessageByUserId,
  getEmailCountByLabelForUser
};

function getLastMessageByUserId(userId) {
  return db("emails").orderBy("uid", "desc").first();
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

function getEmailCountByLabelForUser(label, userId) {
  return db("emails")
    .where("user_id", userId)
    .where('labels', 'ilike', `%${label}%`)
    .count("id").first();
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

function getThreadID(id) {
  return db('emails')
      .where('message_id', id)
      .select('gmThreadID')
}

function getThreadByMessage(message_id) {
  return db('emails')
      .where
}

function searchByAny(query, column, keyword) {
  return db('emails')
      .limit(query.limit)
      .offset(query.skip)
      .where( column, 'ilike', `%${keyword}%`)
      .select('id', 'name',
          'subject', 'date', 'email_body_text')
      .orderBy('date', "desc")
}

function searchAll(query, keyword) {
  return db('emails')
      .limit(query.limit)
      .offset(query.skip)
      .where( 'from' , 'ilike', `%${keyword}%`)
      .orWhere('name','ilike', `%${keyword}%` )
      .orWhere('to','ilike', `%${keyword}%` )
      .orWhere('subject','ilike', `%${keyword}%` )
      .orWhere('email_body_text','ilike', `%${keyword}%` )
      .select('id', 'name',
          'subject', 'date', 'email_body_text')
      .orderBy('date', "desc")
}

function searchByCount(column, keyword) {
  return db("emails")
    .where(column, "ilike", `%${keyword}%`)
    .count("id")
    .first();
}

function getReceived(address) {
  return db('emails')
      .where('from', address)
      .count('id')
}

function getSent(address) {
  return db('emails')
      .where('to', address)
      .count('id')
}

function getNameFromAddress(address) {
  return db('emails')
      .where('from', address)
      .select('name')
}


/////// Old Endpoints ////////
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
