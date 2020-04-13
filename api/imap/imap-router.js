const imapRouter = require("express").Router();
const imapModel = require("./imap-model");

// taggerlabs20@gmail.com
// Lambdalabs20!
// imap.gmail.com

imapRouter.get("/mail", async (req, res) => {
  const imapUser = req.headers["temp-imap-user"];
  const imapPassword = req.headers["temp-imap-password"];
  const imapServer = req.headers["temp-imap-server"];

  if (!imapUser || !imapPassword || !imapServer) {
    res.status(500).json("Credentials Not Found In Headers");
  }
  else
  {
    try {
      const allEmails = await imapModel.getMail({
        imapUser,
        imapPassword,
        imapServer
      });
      
      res.status(200).json(allEmails);
    }
    catch (e) {
      res.status(500).json(e.toString());
    }
  }
});


module.exports = imapRouter;