// ALL OF THIS WAS WRITTEN BY MARCUS JONES (JONESY212)

const request = require('supertest')
const auth = require('./message-router')
const {google} = require('googleapis');


describe('Post Endpoint', () => {
    it('should verify auth', async () => {
 
        let code = req.body.code;
        
        const req = await request(auth)
        .post('/api/postfe')
        .send({
            code: code,
            client_id: "498525641423-gv4h1poto9mdbdlj7qibo9sf0t4f2231.apps.googleusercontent.com",
            client_secret: "AGBziX-GP5CKEc9vckgr28I8",
            redirect_uri: "http://localhost:3000",
            grant_type: "authorization_code"
        })
              
        console.log(code)
        
        expect(res.status).toEqual(200)
        expect(req.body.code).toHaveProperty('post')
        
    })
})


describe('list message', () => {
    it('should list messages for user', async () => {

        const gmail = google.gmail({version: 'v1', auth});

    })
})
// test('Post a valid message', async(done) => {
//     const message = {
//             sender : sender.value,
//             id : res.data.id,
//             subject : subject.value,
//             message : message
//     };

    
//     await Message.then(async function () {

//         await request(app)
//             .get('/api/postfe')
//             .send(message)
//             .then(async() => {
//                 await Message(function (newMessage) {
//                     expect(newMessage).toBe(       '{"from" : " "',
//                     '"id" : "",',
//                     '"subject" : "",',
//                     '"message" : " ",',
//                     '"tag":" "}');
//                     // execute done callback here
//                     done();
//                 });
//             })
//             .catch(err => {
//                 // write test for failure here
//                 console.log(`Error ${err}`)
//                 done()
//             });
//     });
// });

// test('axios call', async(done) => {

//     describe( 'verify code is  req.body.code' let code = req.body.code)
// })

// describe('POST /', () => {
//     it('should return 200 http status code', () => {
//         return request(router)
//         .post('api/postfe')
//         .then(response => {
//             expect(response.status).toBe(200);
//         })
//     })

//     //should return json
//     test('should retun JSON', async () => {
//         const response = await request(router).post('api/postfe')

//         //
//     expect(response.type).toMatch(/json/i);
//     })

//     // test('should return JSON using .then', () => {
//     //     .get()
//     // })

      
// })