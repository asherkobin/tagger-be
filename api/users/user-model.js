const db = require("../../data/dbConfig.js");

module.exports = {
  addUser,
  findUser,
  findUserById,
  updateUser,
  deleteUser
};

function addUser(user) {
  return db("users")
    .insert(user, "id")
    .then(ids => {
      const [id] = ids;
      return findUserById(id);
    });
}

function findUser(user) {
  return db("users")
    .select("id")
    .where("email", "=", user)
    .first();
}

function findUserById(id) {
  return db("users")
    .select("*")
    .where({ id })
    .first();
}

function updateUser(id, changes) {
  return db("users")
    .where({ id })
    .update(changes, "*")
    .then(() => {
      return findUserById(id);
    });
}

function deleteUser(id) {
  return db("users")
    .where({ id })
    .del();
}
