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
const { auth } = require("../auth/authMiddleware");

// ******* GLOBAL VARIABLES **********

const http = rateLimit(axios.create(), {
    maxRequests: 1,
    perMilliseconds: 1750
});
http.getMaxRPS();

// ********* THE ROUTES WITH STREAMING *********

// CREATE STREAM FILE
router.post("/stream", auth, async (req, res) => {
  try {
    const { email } = req.body;
    let userId;

    const user = await Users.findUser(email);
    if (user) {
      userId = user.id;
    }

    const file = await fs.createWriteStream(`./stream/allEmails${userId}.file`);

    const emails = await Messages.emails(userId);
    const data = await JSON.stringify(emails);
    file.write(data);
    file.end();

    const src = await fs.createReadStream(`./stream/allEmails${userId}.file`);

    src.pipe(res);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Server was unable to stream emails", err });
  }
})
// SEND STREAM TO DS

router.post("/train", auth, async (req, res) => {
  try {
    const { email } = req.body;
    let DsUser;
    let Input = {
      address: email,
      emails: []
    };
    let DsEmailStructure = [];

    const user = await Users.findUser(email);
    if (user) {
      DsUser = user.id;
    }

    const streamData = await Messages.emails(DsUser);
    streamData.map(email => {
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
    const dsData = await JSON.stringify(Input);
    
    const file = await fs.createWriteStream(
      `./stream/allEmails${DsUser}Search.file`
    );
    file.write(dsData);
    file.end();

    const src = await fs.createReadStream(
      `./stream/allEmails${DsUser}Search.file`
    );

    const post = await axios({
      method: "POST",
      url:
        "http://ec2-54-185-247-144.us-west-2.compute.amazonaws.com/train_model",
      data: src
    });
    post
      ? res.status(200).json(post.data)
      : res
          .status(500)
          .json({ message: "Server was unable to connect to DS" });

  } catch {
    res.status(500).json({ message: "Server was unable to send data to DS" });
  }
});

router.post("/predict", auth, async (req, res) => {
  try {
    const { email, uid, from, msg } = req.body;
    let Input = {
      address: email,
      emails: [
        {
          uid: uid || " ",
          from: from || " ",
          msg: msg || " ",
          content_type: " "
        }
      ]
    };
    const file = await fs.createWriteStream(`./stream/Predict.file`);
    const dsData = JSON.stringify(Input);
    file.write(dsData);
    file.end();

    const src = await fs.createReadStream(`./stream/Predict.file`);

    axios({
      method: "POST",
      url: "ec2-18-221-62-214.us-east-2.compute.amazonaws.com/predict",
      data: dsData
    })
      .then(response => {
        res.status(200).json(response);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: "Unable to complete search" });
      });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Server was unable to submit search", err });
  }
});

// ********* END THE ROUTES WITH STREAMING *********

// ********* THE NEW ROUTE WITH IMAP FOR TAGGING*********

router.post("/", auth, async (req, res) => {
    try {
        const { email, host, token } = req.body;
        let userId;
        let uid = 1;
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
        lastEmail ? (uid = lastEmail.uid) : null;

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

module.exports = router;
