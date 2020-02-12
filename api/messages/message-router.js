// ****** DEPENDENCIES *********
const router = require("express").Router();
const axios = require("axios");
require("dotenv").config();
const rateLimit = require("axios-rate-limit");
const Imap = require("imap");
const inspect = require("util").inspect;
const simpleParser = require("mailparser").simpleParser;
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

// ********* THE NEW ROUTE WITH IMAP FOR TAGGING************
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
  let userId;
  let emailsUIDs = [];
  Users.findUser(email).then(user => {
    if (user) {
      Messages.getEmailIds(user.id).then(uid => {
        uid.map(id => {
          // console.log(id);
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

  let emailText;
  let emailUID = [];
  let emailData = [];

  function openInbox(cb) {
    imap.openBox("INBOX", true, cb);
  }

  imap.once("ready", function() {
    openInbox(function(err, box) {
      if (err) throw err;
      imap.search(["ALL"], function(err, results) {
        let deletion = results.filter(x => !emailsUIDs.includes(x));
        let difference = emailsUIDs.filter(x => !results.includes(x));

        console.log(deletion, "deletion");
        console.log(emailsUIDs, "emailsUIDS");
        console.log(difference, "difference");
        console.log(results, "results");
        if (err) throw err;
        if (difference.length > 500) {
          difference = difference.slice(-500);
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
        var f = imap.fetch(difference, { bodies: "", attributes: "" });
        f.on("message", function(msg, seqno) {
          // console.log("Message #%d", seqno);
          var prefix = "(#" + seqno + ") ";
          msg.on("body", function(stream, info) {
            simpleParser(stream, { bodies: "", attributes: "" }).then(
              parsed => {
                // Tags.getTagsByMessageId(parsed.messageId).then(tags => {
                // console.log(parsed.f);
                // console.log(parsed.)
                let addEmailObj = {
                  message_id: parsed.messageId,
                  user_id: userId,
                  from: parsed.from.value[0].address,
                  name: parsed.headers.get("from").value[0].name,
                  to: parsed.headers.get("to").text,
                  subject: parsed.subject,
                  email_body: parsed.html,
                  email_body_text: parsed.text
                };
                // let newObj = {
                //   html: parsed.html,
                //   text: parsed.text,
                //   from: parsed.from.value[0].address,
                //   subject: parsed.subject,
                //   attachments: parsed.attachments,
                //   id: parsed.messageId,
                //   uid: 0,
                //   tags
                // };
                // console.log(addEmailObj, "EMAIL BODIES HHEHEHEHHEEHERE");
                // emailText = addEmailObj;
                allMessages.push(addEmailObj);
                console.log(allMessages.length, "adding!");
              }
            );
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
          msg.once("attributes", function(attrs) {
            const uid = {
              uid: attrs.uid
            };
            emailUID.push(uid);

            // const found = emailsIds.includes(element.messageId);
            // if (!found) {
            //   element.uid = attrs.uid;
            //   let sqlEmailId;

            // console.log(parsed.headers.get("to").text);
            // Messages.addEmail(element).then(message => {
            //   sqlEmailId = message.id;
            // let dataTag = res.data.tag;

            // dataTag.forEach(tag => {
            //   let newObj = {
            //     tag,
            //     email_id: sqlEmailId
            //   };
            //   Tags.addTag(newObj);
            // });
            // });
            // })
            // .catch(err => {
            //   console.log(
            //     err,
            //     "Error for posting to DS api for tagging"
            //   );
            // });
            // console.log(message, "the last message");
            // console.log(attrs.uid, "the last message");

            // console.log(prefix + "Attributes: %s", inspect(attrs, false, 8));
            // }
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
          // console.log(emailUID.length, "EMAIL UIDS ARRAYS LENGTH");
          setTimeout(function() {
            // console.log(allMessages.length, "ALL MESSAGES LENGTH");
            let newArray = []; //i think we should have it get 1:1000 ... etc around like 80
            for (i = 0; i < allMessages.length; i++) {
              let message = allMessages[i];
              let uid = emailUID[i];
              let newObj = {
                ...message,
                ...uid
              };
              newArray.push(newObj);
            }
            // console.log(newArray);
            // const found = emailsIds.includes(element.messageId);
            // if (!found) {
            Messages.addEmail(newArray)
              .then(message => {
                res.status(200).json(newArray);
              })
              .catch(err => {
                console.log(err);
              });
            // }
            imap.end();
          }, 1000);
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
