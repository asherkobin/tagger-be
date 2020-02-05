const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../api/server");

chai.use(chaiHttp);

describe("message-router", function() {
  it("should return 200", function() {
    chai
      .request(server)
      .post("/emails/", {
        email: "taggerlabs20@gmail.com",
        //login with above email
        host: "imap.gmail.com",
        //then use access token located in url bar after the redirect to run this test
        token:
          "ya29.Il-8B4e3sbieYYTQOuhgYdONU2ofL_PT1HKHEffERl0-UIf-DJ2DP7r4j2ZAkKtqRQ4ro1PXOpWn9jfQtOJPpyJOSwauPU0nWxtMJokebYTooGVoXuDhyQYEIOxAlWzfpA"
      })
      .end(function(err, res) {
        res.chai.should().have.status(200);
      });
  });
});
