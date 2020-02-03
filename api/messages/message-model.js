const db = require("../../data/dbConfig.js");

module.exports = {
  getEmailIds,
  addEmails,
  deleteAllEmailsByUser
};

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
