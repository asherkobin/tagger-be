const router = require("express").Router();

const nodemailer = require("nodemailer");

router.post("/", (req, res) => {
  const { service, host, port, userEmail, receiver, subject, body, cc, bcc } = req.body;

  let transporter = nodemailer.createTransport({
    service: service, //"gmail",
    host: host, //"smtp.gmail.com",
    secure: "true",
    port: port, // "465",
    auth: {
      type: "OAuth2", //Authentication type
      user: userEmail, //process.env.LABS20,
      clientId: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      refreshToken: process.env.REFRESHTOKEN
    }
  });

  let mailOptions = {
    from: userEmail,
    to: receiver,
    subject: subject,
    text: body,
    cc: cc,
    bcc: bcc
  };

  transporter.sendMail(mailOptions, function(e, r) {
    if (e) {
      console.log(e);
    } else {
      console.log(r);
    }
    transporter.close();
  });
});

module.exports = router;
