const imapService = require("./imap-service");

async function getLatestMail(imapUser, imapPassword, imapServer) {
  return imapService.getLatestMail(imapUser, imapPassword, imapServer);
}

module.exports = {
  getLatestMail
};
