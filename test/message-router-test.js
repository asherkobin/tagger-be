const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../api/server");

chai.use(chaiHttp);

describe("Message-router", function() {
  it("should return 200", function() {
    chai
      .request(server)
      .post("/emails/", {
        email: "taggerlabs20@gmail.com",
        //login with above email
        host: "imap.gmail.com",
        //token value equivalent to output of below function. Info comes from the return url after redirect when logging into google
        // btoa(`user=${user}auth=Bearer ${token}`) <-- contains invisible characters when viewed on Mac. Appear as square characters on PC
        token:
          "dXNlcj10YWdnZXJsYWJzMjBAZ21haWwuY29tAWF1dGg9QmVhcmVyIHlhMjkuSWwtOEJ5TVcwRVdSOEwtLXJfcU1OS2VLSERmYWJ4SU1OUHZQRXg5YW9ySnhEWEdnNkMwbHd2eVBVQlNFYkROeUhZYmNFbkZvZGlWblhJeWlHVzROd3U0eXZlVS1YX0dJcEpfMWQwOFdnVmpqWTZ2Y2ZfRU15V1VXR0JqbTV2RjgtZwEB"
      })
      .end(function(err, res) {
        res.chai.should().have.status(200);
      });
  });
});
