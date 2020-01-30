// const router = require("express").Router();
// const axios = require("axios");

// router.post("/", (req, res) => {
//   const { label } = req.body;

//   let testBody = {
//     label: label,
//     userId: id
//   };

//   // let makeTag = {
//   //   //Enter in
//   //   label: label,
//   //   userId: id
//   // };

//   // An object of options to indicate url, path, object of headers
//   // and the method (CRUD OPERATIONS EX: "DELETE")
//   console.log("hello");
//   var options = {
//     hostname: "http://tagger-email.us-east-2.elasticbeanstalk.com/",
//     path: "api/tags",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     method: "POST"
//   };

//   //create axios call to be able to post to url
//   axios
//     .post(options.hostname + options.path, testBody)
//     .then(result => {
//       console.log(result.data);
//       res.send(result.data);
//     })
//     .catch(err => {
//       console.log(err);
//       res.send(err.stack);
//     });
// });

// module.exports = router;

// // var x = add(3,3,2,10)

// // function add(a,b,c,d){
// //  return a * b/c * d

// // }
// // console.log(x);

// // const cars = [{make: "infiniti", model: "vs", l: "lon-cab"},
// //               {make: "toyota", model: "I9", l: "short cab"}]

// // console.log(cars)
// // console.log(cars[0].make);

// // //object
// // let person = [{
// //   name:'Marcus',
// //   city:'Rules',
// //   state: 'Texas',
// // },]

// // if(person.name == 'Michael'){
// // console.log(`Hello ${person.name} `)
// // } else {
// //   console.log(`This isn't Marcus`)
// // }
// // // [  make {'Honda',
// // //   'Toyota'}
// // // ]

// // let newPerson = person

// // newPerson.push({name:'John',
// // city:'Rules',
// // state: 'Texas',
// // zip: '73505'})
// // console.log(person)

// // newPerson[0].state = "Japan"
// // console.log('begin')
// // console.log({person, newPerson})

// // if(person[1].state === newPerson)
// // {
// //     console.log({person, newPerson})
// //   }else{
// //     console.log("Must use different name")
// // }

// // let numberOfCars = 0
// // cars.forEach(  (car,index) =>  {
// //   numberOfCars++;
// //   console.log('****CAR*****',car.make)
// // })
// // console.log("number of cars", numberOfCars)

// // for (let i = 0; i < cars.length; i++){
// //   console.log('cars',cars[i])
// //   console.log('make',cars[i].make)
// // }

// // let numbefOfPeople = 0
// // for (let i = 0; i < person.length && newPerson.length; i++){
// //   console.log('person', person[i])
// //   console.log("number of people", numbefOfPeople)
// // }

// // const ret = [
// //   { name: "Melvin", age: "27", height: "6,2", hairColor: "black" },
// //   { name: "Mike", age: "31", height: "4'11", hairColor: "blonde" }
// // ];
// // for (r = 0; r < r.length; r++) {
// //   if (ret[r] === ret[n]) {
// //     console.log(r);
// //     ret.splice(n--, 1);
// //     break;
// //   }
// //   return ret;
// //   console.log(ret);
// // }

// // const books = [{color: "yellow", author: ""}]
// //  function retuning(target){
// //   let i = 0,
// //   targets = jQuery(target, this),
// //   l  = targets.length
// // }
// // console.log(retuning)
