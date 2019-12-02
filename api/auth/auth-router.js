// const {OAuth2Client} = require('google-auth-library');

// const client = new OAuth2Client("394607797501-9g0r8lala9ubsh2l6krcp1ini3vkvi2v.apps.googleusercontent.com");

// async function verify() {
//   const ticket = await client.verifyIdToken({
//       idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImRlZThkM2RhZmJmMzEyNjJhYjkzNDdkNjIwMzgzMjE3YWZkOTZjYTMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNDk4NTI1NjQxNDIzLWd2NGgxcG90bzltZGJkbGo3cWlibzlzZjB0NGYyMjMxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNDk4NTI1NjQxNDIzLWd2NGgxcG90bzltZGJkbGo3cWlibzlzZjB0NGYyMjMxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA4Mjc0NDcyODQ0MDA3NTA1NDQ5IiwiZW1haWwiOiJ0YWdnZXJocUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6ImIyTzF4S1R4R2pjTlJDTlkzdDB3Y0EiLCJuYW1lIjoiVGFnZ2VyIEhRIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tRU5uR1BXdWVrXzQvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQUNIaTNyZklETm5HZVd2UHNUSEpsTHd2VGp0RWJNRGFuZy9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiVGFnZ2VyIiwiZmFtaWx5X25hbWUiOiJIUSIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNTc1MzE2OTQyLCJleHAiOjE1NzUzMjA1NDIsImp0aSI6IjgyYWZhMGQyZTA2MTlhYjkwOTFiNjkyOTA4YzNhYjJlMmMyMDZkMTMifQ.CY-HXyNVQvbPL1BCLudCeKpwSqm1O0NlyhvB0ZnLXqt3WvU2UHsk_R29qjYca1Klc9RSY1a4VQa5zLtXHYbnfs7BcsURbL_o_v9tFl9ZBIz1fC5JEh3IjZ-VYBeK1unIDByEIigjAg2WfdtLFom8CrkUUovB8tbnw8n27jjjG0aKwppWOijncNzV1m8CDvqvsdg9oSLCREFj4EfCbfi9HMYIj2LvENbe5OCQVL77SbY7C7Mxor1yU17lNyik0D31MoNcSgJchART6jpRqLos_3d2ihxPz2VzEB4li8-gjgiX4Be3LebpG7DK08ntasp8-KBCtBO1bFINqAMysjMe6A",
//       audience: "498525641423-gv4h1poto9mdbdlj7qibo9sf0t4f2231.apps.googleusercontent.com",  // Specify the CLIENT_ID of the app that accesses the backend
//       // Or, if multiple clients access the backend:
//       //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
//   });
//   const payload = ticket.getPayload();
//   const userid = payload['sub'];
//   // If request specified a G Suite domain:
//   //const domain = payload['hd'];
// }
// verify().catch(console.error);

// module.exports = client