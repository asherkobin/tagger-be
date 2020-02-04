// ****** DEPENDENCIES *********
const router = require("express").Router();
const axios = require("axios");
const { google } = require("googleapis");
require("dotenv").config();
const rateLimit = require("axios-rate-limit");
const Imap = require("imap");
const inspect = require("util").inspect;
const simpleParser = require("mailparser").simpleParser;
const Users = require("../users/user-model");
const Messages = require("./message-model");
const Tags = require("../tags/tag-model");

// ******* GLOBAL VARIABLES **********
let responseLabels = "";
let messages = "";
const http = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1750
});
http.getMaxRPS();

// ********* THE NEW ROUTE WITH IMAP EMAILS WITHOUT TAGS***********
router.post("/", (req, res) => {
  const { email, host, token } = req.body;
  const allMessages = [];

  var imap = new Imap({
    user: email,
    password: "",
    host: host,
    port: 993,
    tls: true,
    xoauth2: token,
    tlsOptions: { rejectUnauthorized: false },
    debug: console.log
  });

  function openInbox(cb) {
    imap.openBox("INBOX", true, cb);
  }

  imap.once("ready", function() {
    openInbox(function(err, box) {
      if (err) throw err;
      imap.search(["ALL"], function(err, results) {
        if (err) throw err;
        var f = imap.fetch(results, { bodies: "" });
        f.on("message", function(msg, seqno) {
          console.log("Message #%d", seqno);
          var prefix = "(#" + seqno + ") ";
          msg.on("body", function(stream, info) {
            console.log(prefix + "Body");
            simpleParser(stream, { bodies: "" })
              .then(parsed => {
                Tags.getTagsByMessageId(parsed.messageId).then(tags => {
                  let newObj = {
                    html: parsed.html,
                    text: parsed.text,
                    from: parsed.from,
                    subject: parsed.subject,
                    attachments: parsed.attachments,
                    id: parsed.messageId,
                    tags
                  };
                  allMessages.push(newObj);
                });
              })
              .catch(err => {
                console.log("\n\n\nerr: ", err);
                res.status(500).json({
                  message: "Server was unable to help you, good luck!"
                });
              });
          });
          msg.once("attributes", function(attrs) {
            console.log(prefix + "Attributes: %s", inspect(attrs, false, 8));
          });
          msg.once("end", function() {
            console.log(prefix + "Finished");
          });
        });
        f.once("error", function(err) {
          console.log("Fetch error: " + err);
        });
        f.once("end", function() {
          console.log("Done fetching all messages!");
          res.status(200).json(allMessages);
          imap.end();
        });
      });
    });

    imap.once("error", function(err) {
      console.log(err);
    });

    imap.once("end", function() {
      console.log("Connection ended");
    });
  });

  imap.connect();
});

// ********* THE NEW ROUTE WITH IMAP FOR TAGGING************
router.post("/tags", (req, res) => {
  const { email, host, token } = req.body;
  const allMessages = [];

  var imap = new Imap({
    user: email,
    password: "",
    host: host,
    port: 993,
    tls: true,
    xoauth2: token,
    tlsOptions: { rejectUnauthorized: false },
    debug: console.log
  });
  let userId;
  let emailsIds = [];
  Users.findUser(email).then(user => {
    if (user) {
      Messages.getEmailIds(user.id).then(message => {
        message.forEach(id => {
          emailsIds.push(id.message_id);
        });
        userId = user.id;
        return emailsIds, userId;
      });
    } else {
      const emailObj = {
        email
      };
      Users.addUser(emailObj).then(user => {
        return (userId = user.id);
      });
    }
  });

  function openInbox(cb) {
    imap.openBox("INBOX", true, cb);
  }

  imap.once("ready", function() {
    openInbox(function(err, box) {
      if (err) throw err;
      imap.search(["ALL"], function(err, results) {
        if (err) throw err;
        var f = imap.fetch(results, { bodies: "", attributes: "" });
        f.on("message", function(msg, seqno) {
          console.log("Message #%d", seqno);
          var prefix = "(#" + seqno + ") ";
          msg.on("body", function(stream, info) {
            // console.log(prefix + "Body");
            simpleParser(stream, { bodies: "", attributes: "" })
              .then(parsed => {
                const found = emailsIds.includes(parsed.messageId);
                if (!found) {
                  //Sending the new message to DS for tagging
                  const dataPackage = {
                    sender: parsed.from.value[0].address,
                    id: parsed.messageId,
                    subject: parsed.subject,
                    message: parsed.html
                  };
                  http
                    .post(
                      "http://LstmModel-env.4zqtqnkaex.us-east-1.elasticbeanstalk.com/api/tags",
                      dataPackage
                    )
                    .then(res => {
                      let sqlEmailId;
                      let addEmailObj = {
                        message_id: parsed.messageId,
                        user_id: userId
                      };
                      Messages.addEmail(addEmailObj).then(message => {
                        sqlEmailId = message.id;
                        let dataTag = res.data.tag;
                        
                        dataTag.forEach(tag => {
                          let newObj = {
                            tag,
                            email_id: sqlEmailId
                          };
                          Tags.addTag(newObj);
                        });
                        const newObj = {
                          html: parsed.html,
                          text: parsed.text,
                          from: parsed.from,
                          subject: parsed.subject,
                          attachments: parsed.attachments,
                          id: parsed.messageId,
                          tags: dataTag
                        };
                        allMessages.push(newObj);
                      });
                    })
                    .catch(err => {
                      console.log(err,"Error for posting to DS api for tagging");
                    });
                } else {
                  Tags.getTagsByMessageId(parsed.messageId).then(tags => {
                    const newObj = {
                      html: parsed.html,
                      text: parsed.text,
                      from: parsed.from,
                      subject: parsed.subject,
                      attachments: parsed.attachments,
                      id: parsed.messageId,
                      tags
                    };
                    allMessages.push(newObj);
                  });
                }
              })
              .catch(err => {
                console.log("\n\n\nerr: ", err);
              });
          });
          msg.once("attributes", function(attrs) {
            console.log(prefix + "Attributes: %s", inspect(attrs, false, 8));
          });
          msg.once("end", function() {
            console.log(prefix + "Finished");
          });
        });
        f.once("error", function(err) {
          console.log("Fetch error: " + err);
        });
        f.once("end", function() {
          console.log("Done fetching all messages!");
          res.status(200).json(allMessages);
          imap.end();
        });
      });
    });
  });

  imap.once("error", function(err) {
    console.log(err);
  });

  imap.once("end", function() {
    console.log("Connection ended");
  });
  imap.connect();
});

module.exports = router;
