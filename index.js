require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const server = require('./api/server.js');


// If modifying these scopes, delete token.json.
const SCOPES = [
'https://www.googleapis.com/auth/gmail.readonly', 
//Read all resources and their metadata—no write operations.

// 'https://www.googleapis.com/auth/gmail.labels',
//Create, read, update, and delete labels only.

'https://www.googleapis.com/auth/gmail.settings.basic'
//Manage basic mail settings.
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  // authorize(JSON.parse(content), listLabels);
  // authorize(JSON.parse(content), listMessages);
  // authorize(JSON.parse(content), getMessage);
  // authorize(JSON.parse(content), testMessage);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}


/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
// function listLabels(auth) {
//   const gmail = google.gmail({version: 'v1', auth});
//   gmail.users.labels.list({
//     userId: 'me',
//   }, (err, res) => {
//     if (err) return console.log('The API returned an error: ' + err);
//     const labels = res.data.labels;
//     if (labels.length) {
//       console.log('Labels:');
//       labels.forEach((label) => {
//         console.log(`- ${label.name}`);
//       });
//     } else {
//       console.log('No labels found.');
//     }
//   });
// }

/**
 * Lists the messages in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

// let array = [];

// function listMessages(auth) {
//   const gmail = google.gmail({version: 'v1', auth});
//   gmail.users.messages.list({
//     userId: 'me',
//   }, (err, res) => {
//     if (err) return console.log('The API returned an error: ' + err);
//     const messages = res.data.messages.id;
//     if (messages.length) {
//       console.log('');
//       console.log('Message ID\'s:');
//       messages.forEach((message) => {
//         array.push(message);
//       });
//       console.log(array);
//     } else {
//       console.log('No messages found.');
//     }
//   });

//   const testMessage = gmail.users.messages.get({userId: 'me', id: array[0]})
//   console.log(testMessage);
// }


/*****  TEST ******/
// var mailparser = new MailParser([])

// var email = "From: 'Sender Name' <sender@example.com>\r\n" + 
//             "To: 'Receiver Name' <receiver@example.com>\r\n"+
//             "Subject: 'Hello World!\r\n" + "\r\n" 
//             + "How are you today";

//   mailparser.on("end", function(mail_object){
//     console.log("From:", mail_object.from); //[{address:'sender@example.com',name:'Sender Name'}]
//     console.log("Subject:", mail_object.subject); // Hello world!
//     console.log("Text body:", mail_object.text); // How are you today?
// });

// send the email source to the parser
// mailparser.write(email);
// mailparser.end();



// async function testMessage(auth) {
//   const gmail = google.gmail({version: 'v1', auth});
//   const response = await gmail.users.messages.get({
//     userId: 'me',
//     id: "16e90110cc2f3a15",
//   });

//   let body = response.data.payload.parts[0].body.data
//   // message_data = response.data.payload.parts.first;
//   // json_data = JSON.parse(message_data.to_json);
//   // decoded_message = Base64.urlsafe_decode64(json_data["body"]["data"]);
//   console.log(Buffer.from(body,'base64').toString());
// }

// async function sendMessage(auth){
//   const gmail = google.gmail({version:'v1', auth});
//   const response = await gmail.users.messages.send({
    
//   })
// }

// const labels = await window.gapi.client.gmail.users.labels.get({userId: "me", id: labelIds[0]});

// function getMessage(auth) {
//   const gmail = google.gmail({version: 'v1', auth});
//   gmail.users.messages.get({
//     userId: 'me',
//     id: '16e85b6dd74b6bf6',
//     format: 'full'
//   }, (err, res) => {
//     if (err) return console.log('The API returned an error: ' + err);
//     const message = res.data.messages;
//     if(message) {
//       console.log('Test Message: ');
//       console.log(`--- ${message}`);
//     } else {
//       console.log('No message found.');
//     }
//   });
// }

// async function getMessage(auth) {
//   const gmail = google.gmail({version: 'v1', auth});
//   const res = await gmail.users.messages.list({ userId: 'me' });
//   console.log(res.data);
//   return res.data;
// };


const port = process.env.PORT;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));








