const { OAuth2Client } = require("google-auth-library");

module.exports = { auth };

function auth(req, res, next) {
    const CLIENT_ID = process.env.CLIENT_ID;

    const client = new OAuth2Client(CLIENT_ID);
    const { id_token } = req.body;
    console.log(id_token, req.body, "TOKEN");
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload["sub"];
        console.log(payload, "payload\n\n\n\n\n\n");
        console.log(userid, "userid\n\n\n\n\n");
        // If request specified a G Suite domain:
        //const domain = payload['hd'];
    }
    verify()
        .then((res) => {
            console.log(res, "res"), next();
        })
        .catch(console.error);
}
