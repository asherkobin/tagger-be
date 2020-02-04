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
                let newObj = {
                  html: parsed.html,
                  text: parsed.text,
                  from: parsed.from,
                  subject: parsed.subject,
                  attachments: parsed.attachments,
                  id: parsed.messageId
                };
                allMessages.push(newObj);
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
        // res.status(200).json(allMessages);
      });

      // this is where we will do res.status() and return the allMessages array for the front end.
      // the allMessages array is an object of emails.
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

  // first we need to see if that email exist in our database (if it does move on else we need to add it)
  let userId;
  Users.findUser(email).then(user => {
    const emailsIds = [];
    if (user) {
      Messages.getEmailIds(user).then(ids => {
        emailsIds = ids;
        userId = user.id;
        return emailsIds, userId;
      });
    } else {
      Users.addUser(email).then(user => {
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
        var f = imap.fetch(results, { bodies: "" });
        f.on("message", function(msg, seqno) {
          console.log("Message #%d", seqno);
          var prefix = "(#" + seqno + ") ";
          msg.on("body", function(stream, info) {
            console.log(prefix + "Body");
            simpleParser(stream, { bodies: "" })
              .then(parsed => {
                console.log("\n\n\nparsed: ", parsed.text);
                //step 0 get all email's messageid from backend
                //step 1 getting all emails
                //step 2 checking if emails are already in database by messageid
                //***Either handle comparision with JS or SQL
                //***SQL has no error handling, but is simpler to do(ANTI JOIN)
                //***JS can be messed up easily to take longer
                //step 3 sending all new emails(one at a time) to ds for tagging
                //step 4 saving data(tags/messageid) ds sends back to database
                //step 5 adding all tags to emails
                //step 6 sending all tagged emails to frontend

                /* the problem i see with SQL is I don't believe we can pick and choose which 
              messageid's (we can't go thru all of them grab the ids and then decide we want to 
              go back to the first message that would have to be another call to open the inbox/
              stream *FROM WHAT I UNDERSTAND*) the only way to do something like this would be to
              store the data as it comes in.  so we have to test each id individually and then 
              decide what to do or store them in 2 arrays 1 for already done and 1 for need to 
              be done.  

              Another solution could be have 1 array for now because DS is not accepting more 
              then 1 message at a time to be tagged.  When we run into a message that needs to 
              be tagged it gets sent to DS when it returns a tag we add to DB and finally add to 
              the array that gets sent to the FE. */

                for (let emailId of emailsIds) {
                  if (parsed.messageId !== emailId) {
                    //Sending the new message to DS for tagging
                    // why is it an http and not axios for tags?
                    http
                      .post(
                        "http://LstmModel-env.4zqtqnkaex.us-east-1.elasticbeanstalk.com/api/tags",
                        {
                          sender: parsed.from,
                          id: parsed.messageId,
                          subject: parsed.subject,
                          message: parsed.text
                        }
                      )
                      .then(res => {
                        let sqlEmailId;
                        let addEmailObj = {
                          message_id: parsed.messageId,
                          user_id: userId
                        };
                        Messages.addEmail(addEmailObj).then(id => {
                          return (sqlEmailId = id);
                        });
                        let dataTag = res.data.tag;
                        dataTag.map(tag => {
                          tag.email_id = sqlEmailId;
                        });
                        Tags.addTag(tags);
                        console.log(parsed.attachments);
                        // now time to create an object and push it to allMessages array.
                        // things we will need for this object.  an array of tags the message from
                        // from messageId subject text attachments
                      });
                  } else {
                    // this is where we will need to pull tags that match the messageid and then
                    // create the object. read the notes above about object contents and push to allMessages.
                  }
                }
                // // results to emailsIds.
                //  seqno.parsed.text
                // test what results exist in database.  send the nonexisting results to datascience to be tagged.  add tag point to message id that points to user.
                // console.log(parsed.headers)
                // console.log(parsed.)
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
      });
      f.once("error", function(err) {
        console.log("Fetch error: " + err);
      });
      f.once("end", function() {
        console.log("Done fetching all messages!");
        imap.end();
      });
    });

    // this is where we will do res.status() and return the allMessages array for the front end.
    // the allMessages array is an object of emails.
  });

  imap.once("error", function(err) {
    console.log(err);
  });

  imap.once("end", function() {
    console.log("Connection ended");
  });

  imap.connect();
});

// ********* POST FROM FE WITH USER'S LOGIN INFORMATION **********
router.post("/postfe", (req, res) => {
  let code = req.body.code;

  res.status(200).json("Successfully hit /postfe endpoint");

  axios
    .post("https://www.googleapis.com/oauth2/v4/token", {
      code: code,
      client_id: process.env.GOOGLE_CLIENT_ID, // GOOGLE_CLIENT_ID is from the heroku config vars
      client_secret: process.env.GOOGLE_CLIENT_SECRET, // GOOGLE_CLIENT_SECRET is from the heroku config vars
      redirect_uri: "postmessage",
      grant_type: "authorization_code"
    })
    .then(res => {
      let token = res.data;

      // Authorize a client, then call the Gmail API.
      authorize(addLabels);

      // Authorize a client, then call the Gmail API.
      setTimeout(() => authorize(getLabels), 2000);

      // Authorize a client, then call the Gmail API.
      setTimeout(() => authorize(getMessageIds), 4000);

      // Authorize a client, then call the Gmail API.
      setTimeout(() => authorize(listMessages), 6000);

      // process.env.GOOGLE_CLIENT_ID and process.env.GOOGLE_CLIENT_SECRET are from the heroku config vars
      function authorize(callback) {
        const oAuth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          "postmessage"
        );

        oAuth2Client.setCredentials(token);
        callback(oAuth2Client);
      }

      // Adds tagger_Labels to user's Gmail account
      function addLabels(auth) {
        const gmail = google.gmail({ version: "v1", auth });
        let taggerLabels = [
          "tagger_Finance",
          "tagger_Entertainment",
          "tagger_Productivity",
          "tagger_Events",
          "tagger_Travel",
          "tagger_Shopping",
          "tagger_Social",
          "tagger_Other"
        ];

        taggerLabels.map(label => {
          gmail.users.labels.create(
            {
              userId: "me",
              resource: {
                name: label,
                labelListVisibility: "labelHide",
                messageListVisibility: "hide"
              }
            },
            (err, res) => {
              if (err) return err;
            }
          );
        });
      }

      // Gets the newly added tagger_Labels from the user's Gmail account
      function getLabels(auth) {
        const gmail = google.gmail({ version: "v1", auth });

        gmail.users.labels.list(
          {
            userId: "me"
          },
          (err, res) => {
            if (err) return err;
            responseLabels = res.data.labels;
          }
        );
      }

      // GETs all messages from the user's Gmail account.
      // Makes a POST to DS API with those messages to get its tagger_Label.
      // Finally, updates those messages on the gmail API with the updated tagger_Label.
      function getMessageIds(auth) {
        const gmail = google.gmail({ version: "v1", auth });

        gmail.users.messages.list(
          {
            userId: "me"
          },
          (err, res) => {
            if (err) return "The API returned an error: " + err;
            messages = res.data.messages;
          }
        );
      }

      function listMessages(auth) {
        const gmail = google.gmail({ version: "v1", auth });

        if (messages.length) {
          messages.forEach(message => {
            gmail.users.messages.get(
              {
                userId: "me",
                id: message.id
              },
              (err, res) => {
                if (err) return err;
                let payload = res.data.payload;
                let idPlaceHolder = res.data.id;

                let sender = payload.headers.find(
                  sender => sender.name === "From"
                );

                let subject = payload.headers.find(
                  subject => subject.name === "Subject"
                );

                if (payload.parts !== undefined) {
                  let message = Buffer.from(
                    payload.parts[0].body.data,
                    "base64"
                  ).toString();

                  http
                    .post(
                      "http://LstmModel-env.4zqtqnkaex.us-east-1.elasticbeanstalk.com/api/tags",
                      {
                        sender: sender.value,
                        id: idPlaceHolder,
                        subject: subject.value,
                        message: message
                      }
                    )

                    .then(res => {
                      console.log(idPlaceHolder);
                      console.log(res.data.tag);
                      let dataTag = res.data.tag;

                      dataTag.forEach(tag => {
                        if (tag === "Finance") {
                          let finance = responseLabels.find(
                            finance => finance.name === "tagger_Finance"
                          );
                          gmail.users.messages.modify({
                            userId: "me",
                            id: idPlaceHolder,
                            resource: {
                              addLabelIds: [finance.id]
                            }
                          }),
                            (err, res) => {
                              if (err) return err;
                              console.log(res);
                            };
                        }

                        if (tag === "Entertainment") {
                          let entertainment = responseLabels.find(
                            entertainment =>
                              entertainment.name === "tagger_Entertainment"
                          );
                          gmail.users.messages.modify({
                            userId: "me",
                            id: idPlaceHolder,
                            resource: {
                              addLabelIds: [entertainment.id]
                            }
                          }),
                            (err, res) => {
                              if (err) return err;
                              console.log(res);
                            };
                        }

                        if (tag === "Productivity") {
                          let productivity = responseLabels.find(
                            productivity =>
                              productivity.name === "tagger_Productivity"
                          );
                          gmail.users.messages.modify({
                            userId: "me",
                            id: idPlaceHolder,
                            resource: {
                              addLabelIds: [productivity.id]
                            }
                          }),
                            (err, res) => {
                              if (err) return err;
                              console.log(res);
                            };
                        }

                        if (tag === "Events") {
                          let events = responseLabels.find(
                            events => events.name === "tagger_Events"
                          );
                          gmail.users.messages.modify({
                            userId: "me",
                            id: idPlaceHolder,
                            resource: {
                              addLabelIds: [events.id]
                            }
                          }),
                            (err, res) => {
                              if (err) return err;
                              console.log(res);
                            };
                        }

                        if (tag === "Travel") {
                          let travel = responseLabels.find(
                            travel => travel.name === "tagger_Travel"
                          );
                          gmail.users.messages.modify({
                            userId: "me",
                            id: idPlaceHolder,
                            resource: {
                              addLabelIds: [travel.id]
                            }
                          }),
                            (err, res) => {
                              if (err) return err;
                              console.log(res);
                            };
                        }

                        if (tag === "Shopping") {
                          let shopping = responseLabels.find(
                            shopping => shopping.name === "tagger_Shopping"
                          );
                          gmail.users.messages.modify({
                            userId: "me",
                            id: idPlaceHolder,
                            resource: {
                              addLabelIds: [shopping.id]
                            }
                          }),
                            (err, res) => {
                              if (err) return err;
                              console.log(res);
                            };
                        }

                        if (tag === "Social") {
                          let social = responseLabels.find(
                            social => social.name === "tagger_Social"
                          );
                          gmail.users.messages.modify({
                            userId: "me",
                            id: idPlaceHolder,
                            resource: {
                              addLabelIds: [social.id]
                            }
                          }),
                            (err, res) => {
                              if (err) return err;
                              console.log(res);
                            };
                        }

                        if (tag === "Other") {
                          let other = responseLabels.find(
                            other => other.name === "tagger_Other"
                          );
                          gmail.users.messages.modify({
                            userId: "me",
                            id: idPlaceHolder,
                            resource: {
                              addLabelIds: [other.id]
                            }
                          }),
                            (err, res) => {
                              if (err) return err;
                              console.log(res);
                            };
                        }
                      });
                    })
                    .catch(error => {
                      console.error(error);
                    });
                }
              }
            );
          });
        } else {
          return "No messages found.";
        }
      }
    })
    .catch(error => {
      console.error(error);
    });
});

module.exports = router;
