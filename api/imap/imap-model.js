const imaps = require("imap-simple");
const Imap = require("imap")
const _ = require("underscore");
const simpleParser = require("mailparser").simpleParser;
const Messages = require("../messages/message-model");
const Promise = require('bluebird')

module.exports = {
  getMail
};

function getUIDs(imap) {
  
}

function getOneMail(obj,emailTo, userId) {
    return {
        uid: obj.attributes.uid,
        from: obj.from.value.map(obj => obj.address).join(","),
        name: obj.from.value.map(obj => obj.name).join(","),
        to: emailTo,
        subject: obj.subject,
        email_body: obj.html,
        email_body_text: obj.text,
        // attachments: obj.attachments,
        message_id: obj.messageId,
        // in_reply_to: obj.inReplyTo,
        date: obj.date,
        labels: obj.attributes["x-gm-labels"].toString(),
        gMsgId: obj.attributes["x-gm-msgid"],
        gmThreadID: obj.attributes["x-gm-thrid"],
        user_id: userId
    };
}

function getD(data, userId) {
    return data.forEach(obj => {
        console.log(obj.to, "THIS IS THE BUNK");
        let emailTo;
        if (!obj.to) {
            emailTo = null
        } else {
            emailTo = obj.to.value.map(obj => obj.address).join(",");
        }
        Messages.addEmail(getOneMail(obj, emailTo, userId))
            .then(res => {
                console.log(`${obj.attributes.uid} was added`);
            })
            .catch(err => {
                console.log(err);
            });
    });
}

function getConfig(imap) {
    return {
        imap: {
            user: imap.email,
            password: "",
            host: imap.host,
            port: 993,
            tls: true,
            xoauth2: imap.token,
            tlsOptions: { rejectUnauthorized: false },
            debug: console.log
        }
    };
}

function getEmails(results) {
    return results.map(email => {
        return new Promise((resolve, reject) => {
            var all = _.find(email.parts, { which: "" });
            var id = email.attributes.uid;
            var idHeader = "uid: " + id + "\r\n";
            var attributes = email.attributes;
            simpleParser(idHeader + all.body, (err, mail) => {
                console.log("SIMPLER PARSER IS HERE");
                const fullEmail = {
                    ...mail,
                    attributes
                };
                resolve(fullEmail);
            });
        });
    });
}

function getMail(imap, userId, lastUid) {
  return new Promise((resolve, reject) => {
    imaps
        .connect(getConfig(imap))
        .then(function(connection) {
          return connection.openBox("[Gmail]/All Mail").then(function() {
            var searchCriteria = ["ALL", ["UID", lastUid + ":*"]];
            var fetchOptions = {bodies: "", attributes: ""};
            return connection.search(searchCriteria, fetchOptions)
                .then(async function(results) {
                  Promise.all(getEmails(results))
                      .then(data => {
                        connection.end();
                        resolve([getD(data, userId)]);
                      })
                      .catch(err => {console.log(err);});
                });
          });
        })
        .catch(err => {
          reject(err);
        });
  });
}
// let d = data.map(obj => {
//   console.log(obj.to, "THIS IS THE BUNK");
//   let to;
//   if (!obj.to.value) {
//     to = obj.to.value.map(obj => obj.address).join(",");
//   } else {
//     to = [];
//   }
//   const oneMail = {
//     uid: obj.attributes.uid,
//     from: obj.from.value.map(obj => obj.address).join(","),
//     name: obj.from.value.map(obj => obj.name).join(","),
//     to: to,
//     subject: obj.subject,
//     email_body: obj.html,
//     email_body_text: obj.text,
//     // attachments: obj.attachments,
//     message_id: obj.messageId,
//     // in_reply_to: obj.inReplyTo,
//     date: obj.date,
//     labels: obj.attributes["x-gm-labels"].toString(),
//     gMsgId: obj.attributes["x-gm-msgid"],
//     gmThreadID: obj.attributes["x-gm-thrid"],
//     user_id: userId
//   };
//   Messages.addEmail(oneMail)
//     .then(res => {
//       console.log(`${obj.attributes.uid} was added`);
//     })
//     .catch(err => {
//       console.log(err);
//     });