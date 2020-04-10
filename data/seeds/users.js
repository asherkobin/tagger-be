
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').trunc()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {id: 1, email: 'taggerlabs20@gmail.com'},
      ]);
    });
};
