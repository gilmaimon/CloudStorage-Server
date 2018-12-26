var expect = require("chai").expect;
var randomstring = require('randomstring');

var request = require('request')
var config = require('../config')

var base_url = "http://localhost:" + config.port;
function sendRequest(path, method, bodyJson, callback) {
    request({
        uri: base_url + path,
        method: method,
        body: JSON.stringify(bodyJson),
        headers: {
            'Content-Type': 'application/json'
        }
    }, callback);
}

function testRegisterWithBadUsername(username) {
    var randomValidPassword = randomstring.generate({ length: 12, charset: 'alphabetic' });
    it("Returns error result for username " + username, function(done) {
        sendRequest('/user/register', 'POST', {username: username, password: randomValidPassword}, function(err, response, body) {
            expect(err).to.equal(null);
            expect(response.statusCode).to.equal(400);
            var bodyJson = JSON.parse(body);
            expect(bodyJson).to.not.equal(null);
            expect(bodyJson.error).to.equal(true);
            done();
        })
    });
}


function testRegisterWithBadPassword(password) {
    var randomValidUsername = randomstring.generate({ length: 12, charset: 'alphabetic' });
    it("Returns error result for password " + password, function(done) {
        sendRequest('/user/register', 'POST', {username: randomValidUsername, password: password}, function(err, response, body) {
            expect(err).to.equal(null);
            expect(response.statusCode).to.equal(400);
            var bodyJson = JSON.parse(body);
            expect(bodyJson).to.not.equal(null);
            expect(bodyJson.error).to.equal(true);
            done();
        })
    });
}

describe("User Registration", function() {
    var randomValidUsername = randomstring.generate({ length: 12, charset: 'alphabetic' });
    var randomValidPassword = randomstring.generate({ length: 12, charset: 'alphabetic' });
    
    describe("Trying to register invalid usernames", function() {
        testRegisterWithBadUsername("gil");
        testRegisterWithBadUsername(123456778);
        testRegisterWithBadUsername(null);
        testRegisterWithBadUsername("aaaaaaaaaaaaaaaaa");
    });

    describe("Trying to register invalid passwords", function() {
        testRegisterWithBadPassword(null);
        testRegisterWithBadPassword("aaaaaaa");
        testRegisterWithBadPassword(1234567890);
        testRegisterWithBadPassword("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    });

    describe("Trying to register with valid credentials", function() {
        console.log({username: randomValidUsername, password: randomValidPassword});
        it("Tries to register when registering is not allowed", function(done) {
            config.allow_registering = false;
            sendRequest('/user/register', 'POST', {username: randomValidUsername, password: randomValidPassword}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(400);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(true);

                config.allow_registering = true;
                done();
            })
        });
    })
});