require("dotenv").config();
const imapService = require("./api/imap/imap-service");
const server = require("./api/server.js");
const port = process.env.PORT || 8000;

server.timeout = 60 * 10 * 1000;

server.listen(port, () => {
  console.log(`\n** Running on port ${port} **\n`);
  setupBackgroundTimers();
});

function setupBackgroundTimers() {
  const numMinutes = 1;

  console.log(`Started imapService.checkForNewMail every ${numMinutes} minutes`);
  setInterval(imapService.checkForNewMail, 1000 * 60 * numMinutes);
}
