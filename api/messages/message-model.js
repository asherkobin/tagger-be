const db = require("../../data/dbConfig.js");

module.exports = {
  getEmailIds,
  addEmail,
  deleteAllEmailsByUser
};

function addEmail(email) {
  return db("emails")
    .insert(email, "id")
    .then(ids => {
      return [ids];
    });
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
