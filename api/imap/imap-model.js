const imaps = require("imap-simple");
const _ = require("underscore");
const simpleParser = require("mailparser").simpleParser;
const Messages = require("../messages/message-model");

module.exports = {
  getMail,
  getBoxes
};

function imapNestedFolders(folders) {
  var FOLDERS = [];
  var folder = {};

  for (var key in folders) {
    if (folders[key].attribs.indexOf("\\HasChildren") > -1) {
      var children = imapNestedFolders(folders[key].children);

      folder = {
        name: key,
        children: children
      };
    } else {
      folder = {
        name: key,
        children: null
      };
    }
    FOLDERS.push(folder);
  }
  return FOLDERS;
}

function getBoxes(imap) {
  let folders = [];
  var config = {
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
  imaps.connect(config).then(function(connection) {
    connection.getBoxes(function(err, boxes) {
      try {
        folders.push(imapNestedFolders(boxes));
        console.log(folders, "THIS IS IN GET BOXESS");
        return folders;
      } catch (err) {
        throw err;
      }
    });
  });
}
// function getBoxes(imap) {
//   var folders = []
//   return new Promise((resolve, reject) => {
//     var config = {
//       imap: {
//         user: imap.email,
//         password: "",
//         host: imap.host,
//         port: 993,
//         tls: true,
//         xoauth2: imap.token,
//         tlsOptions: { rejectUnauthorized: false },
//         debug: console.log
//       }
//     };
//     imaps.connect(config).then(function(connection) {
//       connection.getBoxes().then(function(err, boxes) {
//         connection.end()
//         folders = imapNestedFolders(boxes);
//         console.log(folders)
//         resolve(folders)
//       });
//     }).catch(err => {
//       reject(err)
//     })
//   });
// }

function getMail(imap, userId, lastUid) {
  return new Promise((resolve, reject) => {
    var config = {
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
    imaps
      .connect(config)
      .then(function(connection) {
        return connection.openBox("[Gmail]/All Mail").then(function() {
          var searchCriteria = ["ALL", ["UID", lastUid + ":*"]];
          var fetchOptions = {
            bodies: "",
            attributes: ""
          };
          return connection
            .search(searchCriteria, fetchOptions)
            .then(async function(results) {
              var emails = results.map(email => {
                return new Promise((resolve, reject) => {
                  var all = _.find(email.parts, { which: "" });
                  var id = email.attributes.uid;
                  var idHeader = "uid: " + id + "\r\n";
                  var attributes = email.attributes;
                  simpleParser(idHeader + all.body, (err, mail) => {
                    const fullEmail = {
                      ...mail,
                      attributes
                    };
                    resolve(fullEmail);
                  });
                });
              });
              Promise.all(emails).then(data => {
                connection.end();
                let d = data.map(obj => {
                  const oneMail = {
                    uid: obj.attributes.uid,
                    from: obj.from.value.map(obj => obj.address).join(","),
                    name: obj.from.value.map(obj => obj.name).join(","),
                    to: obj.to.value.map(obj => obj.address).join(","),
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
                  Messages.addEmail(oneMail)
                    .then(res => {
                      console.log(`${uid} was added`);
                    })
                    .catch(err => {
                      console.log(err);
                    });
                });
                resolve(d);
              });
            });
        });
      })
      .catch(err => {
        reject(err);
      });
  });
}
