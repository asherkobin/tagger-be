// ****** DEPENDENCIES *********
const router = require("express").Router();
const axios = require("axios");
const rateLimit = require("axios-rate-limit");
const Imap = require("imap");
const inspect = require("util").inspect;
const simpleParser = require("mailparser").simpleParser;
const fs = require("fs");
const { parse, stringify } = require('flatted')

const Users = require("../users/user-model");
const Messages = require("./message-model");
const Tags = require("../tags/tag-model");

// ******* GLOBAL VARIABLES **********
const http = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1750
});
http.getMaxRPS();

router.get("/", (req, res) => {
  Messages.emails()
    .then(emails => {
      res.status(200).json(emails);
    })
    .catch(err => {
      console.log(err);
      res.status(500);
    });
});
// ********* THE ROUTES WITH STREAMING ************

// CREATE STREAM FILE
router.post("/stream", (req, res) => {
  const { email } = req.body;
  let userID;
  Users.findUser(email)
    .then(user => {
      if (user) return (userID = user.id);
    })
    .then(() => {
      const file = fs.createWriteStream(`./stream/allEmails${userID}.file`);
      Messages.emails(userID)
        .then(emails => {
          const data = JSON.stringify(emails);
          file.write(data);
          file.end();
        })
        .then(() => {
          const src = fs.createReadStream(`./stream/allEmails${userID}.file`);
          console.log("STREAM STREAM");
          src.pipe(res);
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ message: "Server was unable to stream emails" });
        });
    });
});

// SEND STREAM TO DS

router.post("/train", (req, res) => {
  const { email } = req.body;
  let DsUser;
  let Input = {
    emails: [],
    address: email
  }
  let DsEmailStructure = []
  Users.findUser(email)
    .then(user => {
      if (user) {
        DsUser = user.id;
        return DsUser;
      }
    })
    .then(() => {
      const file = fs.createWriteStream(
        `./stream/allEmails${DsUser}Search.file`
      );
      Messages.emails(DsUser)
        .then(emailsDs => {
          emailsDs.map(email => {
            const newStruc = {
              uid : email.uid,
              from : email.from,
              msg : email.email_body_text,
              subject : email.subject,
              content_type: "text"
            }
          DsEmailStructure.push(newStruc)
          })
          
          Input.emails = DsEmailStructure
          const dsData = JSON.stringify(Input);
          file.write(dsData);
          file.end();
        })
        .then(() => {
          console.log("GETS TO AXIOS")
          const src = fs.createReadStream(
            `./stream/allEmails${DsUser}Search.file`
          );
          const {size} = fs.statSync(`./stream/allEmails${DsUser}Search.file`)
          axios({
            method: "POST",
            // header: {
            //   'Content-Type': 'text/markdown',
            //   'Content-Length': size,
            // },
            url: 
              "http://ec2-34-219-168-114.us-west-2.compute.amazonaws.com/train_model",
            data: Input
          })
          .then(dsRes => {
            res.status(200).json({message: dsRes.data})
          })
          .catch(err => {
            console.log(err);
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ message: "Server was unable to stream to DS" });
        });
    })
    .catch(err => {
      res.status(500).json({ message: "Server was unable to stream to DS", err });
    });
});
// ********* END THE ROUTES WITH STREAMING ************

// ********* THE NEW ROUTE WITH IMAP FOR TAGGING************
router.post("/", (req, res) => {
  const { email, host, token } = req.body;
  const allMessages = [];
  let allFetched = false;

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
  let emailsUIDs = [];

  Users.findUser(email).then(user => {
    if (user) {
      Messages.getEmailIds(user.id).then(uid => {
        uid.map(id => {
          emailsUIDs.push(id.uid * 1);
        });

        userId = user.id;
        return emailsUIDs, userId;
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
        let difference = results.filter(x => !emailsUIDs.includes(x));
        let deletion = emailsUIDs.filter(x => !results.includes(x));
        if (err) throw err;
        const emailsLeft = difference;

        if (deletion.length > 0) {
          for (let emailUid of deletion) {
            Messages.deleteEmail(emailUid)
              .then(del => {
                console.log("delete email");
              })
              .catch(err => {
                console.log(err, "delete loop");
              });
          }
        }
        if (difference.length === 0) {
          difference = [results[0]];
          allFetched = true;
        } else if (difference.length > 250) {
          difference = difference.slice(-250);
          allFetched = false;
        }
        for (let i = 0; i < difference.length; i++) {
          var f = imap.fetch(difference[i], { bodies: "", attributes: "" });
          f.on("message", function(msg, seqno) {
            // console.log("Message #%d", seqno);
            var prefix = "(#" + seqno + ") ";
            msg.on("body", function(stream, info) {
              simpleParser(stream, { bodies: "", attributes: "" }).then(
                parsed => {
                  let addEmailObj = {
                    message_id: parsed.messageId,
                    user_id: userId,
                    from: parsed.from.value[0].address,
                    name: parsed.headers.get("from").value[0].name,
                    to: parsed.headers.get("to").text,
                    subject: parsed.subject,
                    email_body: parsed.html,
                    email_body_text: parsed.text,
                    date: parsed.date,
                    uid: difference[i]
                  };
                  Messages.addEmail(addEmailObj)
                    .then(message => {
                      console.log("GOOD");
                    })
                    .catch(err => {
                      console.log(err);
                    });

                  allMessages.push(addEmailObj);
                } //ends parsed
              ); //ends .then on 111
            });
            msg.once("attributes", function(attrs) {});
            msg.once("end", function() {
              console.log(prefix + "Finished");
              let newArray = [];
            });
          }); //ends f.on message
        } //ends for loop

        f.once("error", function(err) {
          console.log("Fetch error: " + err);
        });
        f.once("end", function() {
          console.log("Done fetching all messages!");
          res.status(200).json({
            allEmailsFetched: {
              fetched: allFetched,
              date: Date.now()
            }
          });
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
