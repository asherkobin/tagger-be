exports.up = function(knex) {
  return knex.schema
    .createTable("emails", tbl => {
      tbl.increments();

      tbl
        .string("email")
        .notNullable()
        .unique();
    })
    .createTable("tags", tbl => {
      tbl.increments();

      tbl.string("tag");

      tbl
        .integer("user_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("emails")
        .onDelete("RESTRICT")
        .onUpdate("CASCADE");
    });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("tags").dropTableIfExists("emails");
};
