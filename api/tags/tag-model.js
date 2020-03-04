const db = require("../../data/dbConfig.js");

module.exports = {
  findTags,
  findTagById,
  updateTag,
  deleteTag,
  addTag,
  getTagsByMessageId
};



function addTag(tag) {
  return db("tags")
    .insert(tag, "id")
    .then(ids => {
      const [id] = ids;
      return findTagById(id);
    });
}

function findTags() {
  return db("tags");
}

function findTagById(id) {
  return db("tags")
    .select("*")
    .where({ id })
    .first();
}
function getTagsByMessageId(messageId) {
  return db("tags")
    .join("emails", "emails.id", "tags.email_id")
    .select("tags.tag")
    .where("emails.message_id", messageId);
}

function updateTag(id, changes) {
  return db("tags")
    .where({ id })
    .update(changes, "id")
    .then(() => {
      return findTagById(id);
    });
}

function deleteTag(id) {
  return db("tags")
    .where({ id })
    .del();
}