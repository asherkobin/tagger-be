// ********** DEPENDENCIES **********
const router = require("express").Router();
const axios = require("axios");
const rateLimit = require("axios-rate-limit");
const fs = require("fs");
const imaps = require("imap-simple");

// ********** MODELS **********
const Users = require("../users/user-model");
const Messages = require("./message-model");
const Tags = require("../tags/tag-model");
const Mails = require("../imap/imap-model");
const { auth } = require("../auth/auth-middleware");
// const { imapNestedFolders } = require("./message-middleware")

// ********** GLOBAL VARIABLES **********

const http = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1750
});
http.getMaxRPS();

// ********** THE ROUTES WITH STREAMING **********

// CREATE STREAM FILE
router.post("/stream", auth, async (req, res) => {
  try {
    const { email } = req.body;
    let userId;

    // Grabs User Id
    const user = await Users.findUser(email);
    if (user) {
      userId = user.id;
    }

    // Creates file for streaming
    const file = await fs.createWriteStream(`./stream/allEmails${userId}.file`);
    const emails = await Messages.emails(userId);
    const data = await JSON.stringify(emails);
    if (data) {
      file.write(data);
      file.end(async () => {
        // Creates Readable stream and pipes
        const src = await fs.createReadStream(
          `./stream/allEmails${userId}.file`
        );
        if (src) {
          src.pipe(res);
        }
      });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Server was unable to stream emails", err });
  }
});

// SEND STREAM TO DS
router.post("/train", async (req, res) => {
  try {
    const { email } = req.body;
    let DsUser;
    let Input = {
      address: email,
      emails: []
    };
    let DsEmailStructure = [];

    // Grabs User Id
    const user = await Users.findUser(email);
    if (user) {
      DsUser = user.id;
    }

    // Grabs all emails from database
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

    // Creates file for streaming
    const file = await fs.createWriteStream(
      `./stream/allEmails${DsUser}Search.file`
    );
    file.write(dsData);
    file.end(async () => {
      // Creates readable file
      const src = await fs.createReadStream(
        `./stream/allEmails${DsUser}Search.file`
      );
      // Posts read stream to DS Api
      const post = await axios({
        method: "POST",
        url:
          "http://ec2-54-185-247-144.us-west-2.compute.amazonaws.com/train_model",
        data: src
      });
      post
        ? res.status(200).json({ message: `Trained a model for ${email}` })
        : res
            .status(500)
            .json({ message: "Server was unable to connect to DS" });
    });
  } catch {
    res.status(500).json({ message: "Server was unable to send data to DS" });
  }
});

// SMART SEARCH PREDICTION
router.post("/predict", async (req, res) => {
  try {
    const { email, uid, from, msg, subject } = req.body;
    let Input = {
      address: email,
      emails: [
        {
          uid: uid || " ",
          from: from || " ",
          msg: msg || " ",
          subject: subject || " ",
          content_type: " "
        }
      ]
    };
    // Creates file for streaming
    const file = await fs.createWriteStream(`./stream/Predict.file`);
    const dsData = JSON.stringify(Input);
    file.write(dsData);
    file.end(async () => {
      // Creates read stream
      const src = await fs.createReadStream(`./stream/Predict.file`);
      // Posts search to DS
      const post = await axios({
        method: "POST",
        url:
          "http://ec2-54-185-247-144.us-west-2.compute.amazonaws.com/predict",
        data: src
      });
      post
        ? res.status(200).json(response.data)
        : res.status(500).json({ message: "Unable to complete search" });
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Server was unable to submit search", err });
  }
});
// ********* END THE ROUTES WITH STREAMING *********

// ********* IMAP ROUTES ********

router.post("/", auth, async (req, res) => {
  try {
    const { email, host, token } = req.body;
    let userId;
    let uid = 1;
    let newUserEmail;

    req.setTimeout(600000);
    // Find the user in the database, grab the id
    const user = await Users.findUser(email);
    if (user) {
      userId = user.id;
    } else {
      newUserEmail = { email };
      const newUser = await Users.addUser(newUserEmail);
      newUser ? (userId = newUser.id) : null;
    }

    // Check for the last email from the user, grab the uid
    const lastEmail = await Messages.getLastEmailFromUser(userId);
    lastEmail ? (uid = lastEmail.uid) : null;

    // Get all the emails
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
// GETS ALL BOXES
router.post("/boxes", async (req, res) => {
  try {
    const { email, host, token } = req.body;
    let folders = [];
    var config = {
      imap: {
        user: email,
        password: "",
        host: host,
        port: 993,
        tls: true,
        xoauth2: token,
        tlsOptions: { rejectUnauthorized: false },
        debug: console.log
      }
    };
    // Connects to IMAP and gets boxes
    imaps.connect(config).then(function(connection) {
      connection.getBoxes(function(err, boxes) {
        try {
          folders.push(imapNestedFolders(boxes));
          return folders;
        } catch (err) {
          throw err;
        }
      });
      connection.end();
    });
    // Returns Boxes
    setTimeout(() => {
      folders
        ? res.status(200).json(folders[0])
        : res.status(400).json({
            fetched: false,
            msg: "Emails failed to fetch."
          });
    }, 3000);
  } catch (err) {
    res
      .status(500)
      .json({ fetched: false, err, msg: "The entire request failed." });
  }
});

module.exports = router;
