
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('emails').trunc()
    .then(function () {
      // Inserts seed entries
      return knex('emails').insert([
        {id: 1, message_id: '<98f29004-6c77-308b-0201-36cec79677fc@gmail.com>',
            from: 'taggerlabs20@gmail.com', to: 'receiver_email@service.com',
            subject: 'HERE COMES THE SPAM', email_body: '0',
            email_body_text: '"WE\'RE GOIGN TO JAM, YOUR MAILBOX FULL OF SPAM!\n' +
                '"',
            date: '1580157214000.0', uid: '3', labels: 'sent', gMsgId: '1656914933919808974',
            gmThreadID: '1656914933919808974', user_id: 1},
      ]);
    });
};
