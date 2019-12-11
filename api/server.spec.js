const request = require('supertest');

const server = require('./server')

describe('GET /', () => {
    //should return http 200 ok
    it('should return 200 http status code', () => {
        return request(server)
        .get('/')
        .then(response => {
            expect(response.status).toBe(200);
        });
    });

    //should return json
    test('should return JSON', async () => {
        const response = await request(server).get('/');

        //toMatch uses a regula expression to check
        //the value
        expect(response.type).toMatch(/json/i);
    });


    //writing with async whtn a then
    test('should return JSON using .then', () => {
        return request(server)
        .get('/')
        .then(response => {
        expect(response.type).toMatch(/json/i);
        })

        //toMatch uses a regula expression to check
        //the value
    });

    //should return an object 
    //with an api property with the value 'up'

    it('should return {api: "up"}', async () => {
        const response = await request(server).get('/');

        expect(response.body).toEqual({api:'up'});
        expect(response.body.api).toBe('up');
    })
    //object with an api property with the value 'up
});


