require("dotenv").config();

const knex = require("knex");
const environment = process.env.DB_CONNECT || "development";
const config = require("../knexfile");

module.exports = knex(config[environment]);
