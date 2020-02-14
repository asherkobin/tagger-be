// ****** DEPENDENCIES *********
const router = require("express").Router();
const axios = require("axios");
const rateLimit = require("axios-rate-limit");
const Imap = require("imap");
const inspect = require("util").inspect;
const simpleParser = require("mailparser").simpleParser;
const fs = require("fs");

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
          src.pipe(res);
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ message: "I don't like you" });
        });
    });
});

// SEND STREAM TO DS

// ********* THE ROUTES WITH STREAMING ************

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
          difference = [results[0]]
          allFetched = true
        } else if (difference.length > 250) {
          difference = difference.slice(-250);
          allFetched = false
        }
          // emailsUIDs === results;
          // first round look for deleted uids.
          // second round look for missing uids from database
          // third round max out array at 500 emails
          // results is an array of uids we can cut this array down and also create a new field in the table that tells us how many times we would need to do this process to get to the latest emails.
          // prolly would be best to send something to the frontend in our res.status letting it know if this contains all emails or just partial.
          // we could also just grab the last 100 emails because this is a ascn order array.  we can just change the array results to last x of emails.
          // the idea call database and get all uids that are already added and subtract that from results then limit results to only 500 items.
          // this is also helpful because we also know that if a uid is not in this list that we will need to delete it from our database as its been deleted.
          // 1. call database with user_id to find UID
          // 2. compare results with step 1 and reduce to x emails (500 should be good)
          // 3. ????????
          // 4. profit!
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
                //Sending the new message to DS for tagging
                // const dataPackage = {
                //   sender: parsed.from.value[0].address,
                //   id: parsed.messageId,
                //   subject: parsed.subject,
                //   message: parsed.html
                // };
                // http
                //   .post(
                //     "http://LstmModel-env.4zqtqnkaex.us-east-1.elasticbeanstalk.com/api/tags",
                //     dataPackage
                //   )
                //   .then(res => {
                // })
                // .catch(err => {
                //   console.log("\n\n\nerr: ", err);
                // });
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
            })
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
