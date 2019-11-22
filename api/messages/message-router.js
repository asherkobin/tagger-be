const router = require("express").Router();
const axios = require("axios");
 

router.post("/", (req, res) => {
 
  /******POST REQUEST OPTION 1 *******/

  
 const {sender, id, subject, message} = req.body

//   let postBody = {
//       sender, id, subject, message
//   }

   let postBody = {
       sender:  sender,
       id:  id,
       subject:  subject,
       message:  message
   }
  
  // An object of options to indicate where to post to

  console.log("hello");
  var options = {
    hostname: "http://tagger-email.us-east-2.elasticbeanstalk.com/",
    path: "api/tags",
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  };

  axios
    .post(options.hostname + options.path, postBody)
    .then(result => {
      console.log(result.data);
      res.send(result.data);
    })
    .catch(err => {
      console.log(err);
      res.send(err);
    });
});

module.exports = router;