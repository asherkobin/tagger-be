// const fs = require('fs');
// const readline = require('readline');
// const {google} = require('googleapis');

// // If modifying these scopes, delete token.json.
// const SCOPES = [
//     'https://www.googleapis.com/auth/gmail.readonly', 
//     //Read all resources and their metadata—no write operations.
    
//     // 'https://www.googleapis.com/auth/gmail.labels',
//     //Create, read, update, and delete labels only.
    
//     'https://www.googleapis.com/auth/gmail.settings.basic'
//     //Manage basic mail settings.
//     ];
//     // The file token.json stores the user's access and refresh tokens, and is
//     // created automatically when the authorization flow completes for the first
//     // time.
//     const TOKEN_PATH = 'token.json';
    
//     // Load client secrets from a local file.
//     fs.readFile('credentials.json', (err, content) => {
//       if (err) return console.log('Error loading client secret file:', err);
//       // Authorize a client with credentials, then call the Gmail API.
//       // authorize(JSON.parse(content), listLabels);
//       // authorize(JSON.parse(content), listMessages);
//       // authorize(JSON.parse(content), getMessage);
//       // authorize(JSON.parse(content), testMessage);
//     });
    
//     /**
//      * Create an OAuth2 client with the given credentials, and then execute the
//      * given callback function.
//      * @param {Object} credentials The authorization client credentials.
//      * @param {function} callback The callback to call with the authorized client.
//      */
//     function authorize(credentials, callback) {
//       const {client_secret, client_id, redirect_uris} = credentials.installed;
//       const oAuth2Client = new google.auth.OAuth2(
//           client_id, client_secret, redirect_uris[0]);
    
//       // Check if we have previously stored a token.
//       fs.readFile(TOKEN_PATH, (err, token) => {
//         if (err) return getNewToken(oAuth2Client, callback);
//         oAuth2Client.setCredentials(JSON.parse(token));
//         callback(oAuth2Client);
//       });
//     }
    
//     /**
//      * Get and store new token after prompting for user authorization, and then
//      * execute the given callback with the authorized OAuth2 client.
//      * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
//      * @param {getEventsCallback} callback The callback for the authorized client.
//      */
//     function getNewToken(oAuth2Client, callback) {
//       const authUrl = oAuth2Client.generateAuthUrl({
//         access_type: 'offline',
//         scope: SCOPES,
//       });
//       console.log('Authorize this app by visiting this url:', authUrl);
//       const rl = readline.createInterface({
//         input: process.stdin,
//         output: process.stdout,
//       });
//       rl.question('Enter the code from that page here: ', (code) => {
//         rl.close();
//         oAuth2Client.getToken(code, (err, token) => {
//           if (err) return console.error('Error retrieving access token', err);
//           oAuth2Client.setCredentials(token);
//           // Store the token to disk for later program executions
//           fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//             if (err) return console.error(err);
//             console.log('Token stored to', TOKEN_PATH);
//           });
//           callback(oAuth2Client);
//         });
//       });
//     }
    
    
//     /**
//      * Lists the labels in the user's account.
//      *
//      * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
//      */
//     // function listLabels(auth) {
//     //   const gmail = google.gmail({version: 'v1', auth});
//     //   gmail.users.labels.list({
//     //     userId: 'me',
//     //   }, (err, res) => {
//     //     if (err) return console.log('The API returned an error: ' + err);
//     //     const labels = res.data.labels;
//     //     if (labels.length) {
//     //       console.log('Labels:');
//     //       labels.forEach((label) => {
//     //         console.log(`- ${label.name}`);
//     //       });
//     //     } else {
//     //       console.log('No labels found.');
//     //     }
//     //  ' });
//     // }
    
//     // END OF ORIGINAL GMAIL API CALL *******************
    
//     /**
//      * Lists the messages in the user's account.
//      *
//      * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
//      */
    
//     // let array = [];
    
//     // function listMessages(auth) {
//     //   const gmail = google.gmail({version: 'v1', auth});
//     //   gmail.users.messages.list({
//     //     userId: 'me',
//     //   }, (err, res) => {
//     //     if (err) return console.log('The API returned an error: ' + err);
//     //     const messages = res.data.messages.id;
//     //     if (messages.length) {
//     //       console.log('');
//     //       console.log('Message ID\'s:');
//     //       messages.forEach((message) => {
//     //         array.push(message);
//     //       });
//     //       console.log(array);
//     //     } else {
//     //       console.log('No messages found.');
//     //     }
//     //   });
    
//     //   const testMessage = gmail.users.messages.get({userId: 'me', id: array[0]})
//     //   console.log(testMessage);
//     // }

// module.exports = SCOPES









// /****** CAN DELETE MAY NOT BE NEEDED ******/


// // const {OAuth2Client} = require('google-auth-library');

// // const client = new OAuth2Client("394607797501-9g0r8lala9ubsh2l6krcp1ini3vkvi2v.apps.googleusercontent.com");

// // async function verify() {
// //   const ticket = await client.verifyIdToken({
// //       idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImRlZThkM2RhZmJmMzEyNjJhYjkzNDdkNjIwMzgzMjE3YWZkOTZjYTMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNDk4NTI1NjQxNDIzLWd2NGgxcG90bzltZGJkbGo3cWlibzlzZjB0NGYyMjMxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNDk4NTI1NjQxNDIzLWd2NGgxcG90bzltZGJkbGo3cWlibzlzZjB0NGYyMjMxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA4Mjc0NDcyODQ0MDA3NTA1NDQ5IiwiZW1haWwiOiJ0YWdnZXJocUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6ImIyTzF4S1R4R2pjTlJDTlkzdDB3Y0EiLCJuYW1lIjoiVGFnZ2VyIEhRIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tRU5uR1BXdWVrXzQvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUNIaTNyZklETm5HZVd2UHNUSEpsTHd2VGp0RWJNRGFuZy9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiVGFnZ2VyIiwiZmFtaWx5X25hbWUiOiJIUSIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNTc1MzE2OTQyLCJleHAiOjE1NzUzMjA1NDIsImp0aSI6IjgyYWZhMGQyZTA2MTlhYjkwOTFiNjkyOTA4YzNhYjJlMmMyMDZkMTMifQ.CY-HXyNVQvbPL1BCLudCeKpwSqm1O0NlyhvB0ZnLXqt3WvU2UHsk_R29qjYca1Klc9RSY1a4VQa5zLtXHYbnfs7BcsURbL_o_v9tFl9ZBIz1fC5JEh3IjZ-VYBeK1unIDByEIigjAg2WfdtLFom8CrkUUovB8tbnw8n27jjjG0aKwppWOijncNzV1m8CDvqvsdg9oSLCREFj4EfCbfi9HMYIj2LvENbe5OCQVL77SbY7C7Mxor1yU17lNyik0D31MoNcSgJchART6jpRqLos_3d2ihxPz2VzEB4li8-gjgiX4Be3LebpG7DK08ntasp8-KBCtBO1bFINqAMysjMe6A",
// //       audience: "498525641423-gv4h1poto9mdbdlj7qibo9sf0t4f2231.apps.googleusercontent.com",  // Specify the CLIENT_ID of the app that accesses the backend
// //       // Or, if multiple clients access the backend:
// //       //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
// //   });
// //   const payload = ticket.getPayload();
// //   const userid = payload['sub'];
// //   // If request specified a G Suite domain:
// //   //const domain = payload['hd'];
// // }
// // verify().catch(console.error);

// // module.exports = client