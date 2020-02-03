exports.up = function(knex) {
  return knex.schema
    .createTable("users", tbl => {
      tbl.increments();

      tbl
        .string("email")
        .notNullable()
        .unique();
    })
    .createTable("emails", tbl => {
      tbl.increments();

      tbl
        .integer("message_id")
        .notNullable()
        .unique();

      tbl
        .integer("user_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("RESTRICT")
        .onUpdate("CASCADE");
    })

    .createTable("tags", tbl => {
      tbl.increments();

      tbl.string("tag");

      tbl
        .integer("email_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("emails")
        .onDelete("RESTRICT")
        .onUpdate("CASCADE");
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists("tags")
    .dropTableIfExists("emails")
    .dropTableIfExists("users");
};
