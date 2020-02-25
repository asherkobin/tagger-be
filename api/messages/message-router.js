// ********* DEPENDENCIES *********
const router = require("express").Router();
const axios = require("axios");
const rateLimit = require("axios-rate-limit");
const fs = require("fs");

// ********* MODELS *********
const Users = require("../users/user-model");
const Messages = require("./message-model");
const Tags = require("../tags/tag-model");
const Mails = require("../imap/imap-model");

// ********* GLOBAL VARIABLES **********
const http = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1750
});
http.getMaxRPS();

// ********* THE ROUTES WITH STREAMING *********

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
    address: email,
    emails: []
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
              content_type: " "
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
          axios({
            method: "POST",
            url:
              "http://ec2-54-185-247-144.us-west-2.compute.amazonaws.com/train_model",
            data: src
          })
            .then(dsRes => {
              res.status(200).json(dsRes.data)
            })
            .catch(err => {
              res.status(500).json({message: "Server was unable to connect to DS", err})
            });
        })
        .catch(err => {
          res
            .status(500)
            .json({ message: "Server was unable to stream to DS" }, err);
        });
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: "Server was unable to stream to DS", err });
    });
});

router.post("/testTrain", async (req, res) => {
  try {
    const { email } = req.body;
    let DsUser;
    let Input = {
      address: email,
      emails: []
    };
    let DsEmailStructure = [];
    const user = await Users.findUser(email);
    user
      ? (DsUser = user.id)
      : res.status(404).json({ message: "User not Found" });

    const streamData = await Messages.emails(DsUser)
    streamData.map(email => {
        const newStruc = {
          uid: email.uid,
          from: email.from,
          msg: email.email_body_text,
          subject: email.subject,
          content_type: " "
        };
        DsEmailStructure.push(newStruc);
    })
    Input.emails = DsEmailStructure;
    const dsData = JSON.stringify(Input);
    file.write(dsData);
    file.end();
    const file = await fs.createWriteStream(
      `./stream/allEmails${DsUser}Search.file`
    );
  } catch {
    res.status(500).json({ message: "Server was unable to send data to DS" })
  }
});
// ********* END THE ROUTES WITH STREAMING *********

// ********* THE NEW ROUTE WITH IMAP FOR TAGGING*********

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
      : res
          .status(400)
          .json({ fetched: false, msg: "Emails failed to fetch." });
  } catch (err) {
    res
      .status(500)
      .json({ fetched: false, err, msg: "The entire request failed." });
  }
});

router.post("/boxes", async (req, res) => {
  try {
    const { email, host, token } = req.body;
    // get all boxes
    const boxes = await Mails.getBoxes(req.body)
    console.log(boxes, "THIS IS WHAT IM GETTING BACK")
    boxes
      ? res
          .status(200)
          .json(boxes)
      : res
          .status(400)
          .json({ fetched: false, msg: "Emails failed to fetch.", THISISBOXES: boxes });

  } catch (err) {
    res
      .status(500)
      .json({ fetched: false, err, msg: "The entire request failed." });
  }
});

// router.post("/boxes", (req,res) => {

//   Mails.getBoxes(req.body).then(boxes => {
//     console.log(boxes, "THIS IS IN THE .THEN")
//     res.status(200).json(boxes)
//   }).catch(err => {
//     console.log(err)
//     res.status(500).json(err)
//   })
// })

module.exports = router;
