const db = require("../data/dbConfig.js");

module.exports = {
  findTags,
  findTagById,
  updateTag,
  deleteTag,
  addTag
};

function addTag(tag) {
  return db("tags")
    .insert(tag, "id")
    .then(ids => {
      const [id] = ids;
      return findTagById(id);
    });
}
function findTags(tag) {
  return db("tags")
    .select("*")
    .where("tag", "=", tag)
    .first();
}
function findTagById(id) {
  return db("tags")
    .select("*")
    .where({ id }).first;
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
