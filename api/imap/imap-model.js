const imapSimple = require("imap-simple");
const simpleParser = require("mailparser").simpleParser;

async function getMail({ imapUser, imapPassword, imapServer }) {
    const imapConnection = await imapSimple.connect({
        imap: {
            user: imapUser,
            password: imapPassword,
            host: imapServer,
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            debug: console.log
        }});

    await imapConnection.openBox("INBOX");

    const lastUid = 180; // TODO: Get value from DB: Messages.getLastEmailFromUser
    const searchCriteria = ["ALL", ["UID", lastUid + ":*"]];
    const fetchOptions = { bodies: "", attributes: "" };

    const searchResults = await imapConnection.search(searchCriteria, fetchOptions);

    imapConnection.end();

    const parsedMessages = await parseImapSearchResults(searchResults);

    return parsedMessages;
}

async function parseImapSearchResults(searchResults) {
    const imapMessages = Promise.all(searchResults.map(async imapMessage => {
        const firstPart = imapMessage.parts.find(part => part.which === "");
        const uId = imapMessage.attributes.uid;
        const idHeader = "uid: " + uId + "\r\n";
        const attributes = imapMessage.attributes;
        
        const parsedMessage = await simpleParser(idHeader + firstPart.body);
        
        return { ...parsedMessage, attributes };
    }));

    return imapMessages;
}

module.exports = {
  getMail
};