
// //AUTHENTICATE GOOGLE ID TOKEN TO BE ABLE TO POST/SAVE TAGS
// //CREATE A GET TO ACCESS TAGS AND MESSAGES FROM DATA SCIENCE
// //CREATE A POST TO BE ABLE TO GRABE MESSAGES WITH TAGS TO FRONTEND



// /*******ORIGINAL ROUTER **********/
// const router = require("express").Router();
// const axios = require("axios");
// // const auth = require('../auth/auth-router')


// router.post("/", (req, res) => {
  
//     //   /******POST REQUEST OPTION 1 *******/
    
//      const {sender, id, subject, message} = req.body
    
//       // let postBody = {
//       //     sender, id, subject, message
//       // }
    
//        let postBody = {
//            sender:  sender,
//            id:  id,
//            subject:  subject,
//            message:  message
//        }
    
//        let testBody = {
//          from: "Small Tall",
//          id: '12',
//          subject: "See Small Think Big",
//          message: "Focus on what is directly ahead of you"
//        }
      
//       // An object of options to indicate where to post to
    
//       console.log("hello");
//       var options = {
//         hostname: "http://tagger-email.us-east-2.elasticbeanstalk.com/",
//         path: "api/tags",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         method: "POST"
//       };
    
    
//       // axios call made 
//       axios
//         .post(options.hostname + options.path, postBody)
//         .then(result => {
//           console.log(result.data);
//           res.send(result.data);
//         })
//         .catch(err => {
//           console.log(err);
//           res.send(err);
//         });
    
//     });

//     module.exports = router;
      