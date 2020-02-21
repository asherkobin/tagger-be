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
const Mails = require("../imap/imap-model");

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
          res
            .status(500)
            .json({ message: "Server was unable to stream emails" });
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
  };
  let DsEmailStructure = [];
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
              uid: email.uid,
              from: email.from,
              msg: email.email_body_text,
              subject: email.subject,
              content_type: "text"
            };
            DsEmailStructure.push(newStruc);
          });

          Input.emails = DsEmailStructure;
          const dsData = JSON.stringify(Input);
          file.write(dsData);
          file.end();
        })
        .then(() => {
          console.log("GETS TO AXIOS");
          const src = fs.createReadStream(
            `./stream/allEmails${DsUser}Search.file`
          );
          const { size } = fs.statSync(
            `./stream/allEmails${DsUser}Search.file`
          );
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
              res.status(200).json({ message: dsRes.data });
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
          res
            .status(500)
            .json({ message: "Server was unable to stream to DS" });
        });
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: "Server was unable to stream to DS", err });
    });
});
// ********* END THE ROUTES WITH STREAMING ************

// ********* THE NEW ROUTE WITH IMAP FOR TAGGING************

router.post("/", async (req, res) => {
  try {
    const { email, host, token } = req.body;
    let userId;
    let uid;
    let newUserEmail;

    // find the user in the database, grab the id
    const user = await Users.findUser(email);
    if (user) {
      userId = user.id;
    } else {
      newUserEmail = { email };
      const newUser = await Users.addUser(newUserEmail);
      newUser ? (userId = newUser.id) : null;
    }

    // check for the last email from the user, grab the uid
    const lastEmail = await Messages.getLastEmailFromUser(userId);
    lastEmail ? (uid = lastEmail.uid) : (uid = 1);

    // get all the emails
    const emails = await Mails.getMail(req.body, userId, uid);
    emails
      ? res
          .status(200)
          .json({ allEmailsFetched: { fetched: true, date: Date.now() } })
      : res.status(400).json({ msg: "Emails failed to fetch." });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, err, msg: "The entire request failed." });
  }
});

module.exports = router;
