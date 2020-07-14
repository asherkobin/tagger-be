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
  const numMinutes = 10;

  // update after 1 second, then every 10 minutes
  console.log(`Started imapService.checkForNewMail every ${numMinutes} minutes`);
  setTimeout(imapService.checkForNewMail, 1000);
  setInterval(imapService.checkForNewMail, 1000 * 60 * numMinutes);
}
