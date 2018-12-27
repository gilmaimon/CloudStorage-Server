var expect = require("chai").expect;
var randomstring = require('randomstring');

var sendRequest = require('./base_api_request')
var config = require('../app/config')


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
        if(config.allow_registering) {
            it("Tries to register when registering is allowed", function(done) {
                sendRequest('/user/register', 'POST', {username: randomValidUsername, password: randomValidPassword}, function(err, response, body) {
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(false);
                    done();
                });
            });

            it("Tries to register with username that already exists", function(done) {
                sendRequest('/user/register', 'POST', {username: randomValidUsername, password: randomValidPassword}, function(err, response, body) {
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(400);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(true);
                    done();
                });
            });
        } else {
            it("Tries to register when registering is not allowed", function(done) {
                sendRequest('/user/register', 'POST', {username: randomValidUsername, password: randomValidPassword}, function(err, response, body) {
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(400);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(true);
                    done();
                });
            });
        }
    });
});