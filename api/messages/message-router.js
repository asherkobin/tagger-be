const router = require("express").Router();

/******POST REQUEST OPTION 1 *******/
function makeBody(to, from, subject, message) {
  let str = [
    "to: ",
    to,
    "\n",
    "from: ",
    from,
    "\n",
    "subject: ",
    subject,
    "\n\n",
    message
  ].join("");
  return str;
}

async function getIdAsync(token, resp) {
  return new Promise((resolve, reject) => {
    let raw = makeBody(
      "something@gmail.com",
      "something@gmail.com",
      "Subject Here",
      "blah blah blah"
    );

    var options = {
      hostname: "www.googleapis.com",
      path: "/upload/gmail/v1/users/me/messages/send",
      headers: {
        Authorization: "Bearer" + token,
        "Content-Type": "message/rfc822"
      },
      method: "POST"
    };

    const req = https.request(options, res => {
      var body = "";

      res.on("data", d => {
        body += d;
      });
      res.on("end", () => {
        var parsed = body;
        console.log(parsed);
      });
    });

    req.on("error", e => {
      console.error(e);
    });
    req.write(raw);
    req.end();
  });
}

/****** END ******/

module.exports = function sendMail(oauth2token, raw) {
  var options = {
    method: "POST",
    url: "https://www.googleapis.com/gmail/v1/users/me/messages/send",
    headers: {
      "HTTP-Version": "HTTP/1.1",
      "Content-Type": "application/json",
      Authorization: "Bearer" + oauth2token
    },
    body: JSON.stringify({
      raw: raw
    })
  };

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      context.log(body);
    }
    if (error) {
      context.log(error);
    } else {
      context.log(response);
    }
  });
};

/***** POST REQUEST OPTION 2 ******/

function sendMail(oauth2token, raw) {
  var options = {
    method: "POST",
    url: "https://www.googleapis.com/gmail/v1/users/me/messages/send",
    headers: {
      "HTTP-Version": "HTTP/1.1",
      "Content-Type": "application/json",
      Authorization: "Bearer " + oauth2token
    },
    body: JSON.stringify({
      raw: raw
    })
  };
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      context.log(body);
    }
    if (error) {
      context.log(error);
    } else {
      context.log(response);
    }
  });
}

/*********END*********/

/*********POST REQUEST OPTION 3********/
var email =
  'Content-Type: text/plain; charset="UTF-8"\n' +
  "Content-length: 5000\n" +
  "MIME-Version: 1.0\n" +
  "Content-Transfer-Encoding: message/rfc2822\n" +
  "to: something@something.com\n" +
  'from: "Some Name" <something@gmail.com>\n' +
  "subject: Hello world\n\n" +
  "The actual message text goes here";

async function sendMail(token, resp) {
  return new Promise((resolve, reject) => {
    var base64EncodedEmail = Buffer.from(email).toString("base64");
    var base64urlEncodedEmail = base64EncodedEmail
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    var params = {
      userId: "me",
      resource: {
        raw: base64urlEncodedEmail
      }
    };

    var body2 = {
      raw: base64urlEncodedEmail
    };

    var options = {
      hostname: "www.googleapis.com",
      path: "/upload/gmail/v1/users/me/messages/send",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "message/rfc822"
      },
      body: {
        raw: base64urlEncodedEmail,
        resource: {
          raw: base64urlEncodedEmail
        }
      },
      data: JSON.stringify({
        raw: base64urlEncodedEmail,
        resource: {
          raw: base64urlEncodedEmail
        }
      }),
      message: {
        raw: base64urlEncodedEmail
      },
      payload: {
        raw: base64urlEncodedEmail //this is me trying everything I can think of
      },
      // body: raw,
      // }
      userId: "me",
      resource: {
        raw: base64urlEncodedEmail
      },
      method: "POST"
    };

    var id = "";
    console.log(base64urlEncodedEmail);
    const req = https.request(options, res => {
      var body = "";

      res.on("data", d => {
        body += d;
      });
      res.on("end", () => {
        var parsed = body;
        console.log(parsed);
      });
    });

    req.on("error", e => {
      console.error(e);
    });
    req.write(JSON.stringify(body2));
    req.end();
  });
}
