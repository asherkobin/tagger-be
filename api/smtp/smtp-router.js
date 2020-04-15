const smtpRouter = require("express").Router();
const nodeMailer = require("nodemailer");

smtpRouter.post("/send", (req, res) => {
  const { from, to, subject, text, cc, bcc } = req.body;

  const smtpTransport = nodeMailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: "true",
    port: 465,
    auth: {
      user: "taggerlabs20@gmail.com",
      pass: "Lambdalabs20!"
    }
  });

  const mailOptions = {
    from,
    to,
    subject,
    text,
    cc,
    bcc
  };

  //  This wasn't used before??
  // auth: {
  //   type: "OAuth2", //Authentication type
  //   user: userEmail, //process.env.LABS20,
  //   clientId: process.env.CLIENTID,
  //   clientSecret: process.env.CLIENTSECRET,
  //   refreshToken: process.env.REFRESHTOKEN,
  //   accessToken: token
  // }

  smtpTransport.sendMail(mailOptions, (error, result) => {
    if (error) {
      console.log("smtpRouter ERROR: " + error);

      res.status(400).json({
        smtpError: error
      });
    } else {
      console.log("smtpRouter SUCCESS: " + result);

      res.status(200).json({
        smtpResponse: result
      });
    }
    smtpTransport.close();
  });
});

module.exports = smtpRouter;
