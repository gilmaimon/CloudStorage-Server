var expect = require("chai").expect;
var randomstring = require('randomstring');

var sendRequest = require('./base_api_request')
var config = require('../app/config')

describe("User Access", function() {
    var randomValidUsername = randomstring.generate({ length: 12, charset: 'alphabetic' });
    var randomValidPassword = randomstring.generate({ length: 12, charset: 'alphabetic' });

    describe("Login Tries", function() {
        it("Should register a user for tests with no errors", function(done) {
            sendRequest('/user/register', 'POST', {username: randomValidUsername, password: randomValidPassword}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                done();
            });
        });
        
        it("Tries to register with invalid credentials - 1", function(done) {
            sendRequest('/data/object', 'POST', {username: "abcde", password: "abcde", key: "str", value: "somestring"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(401);
                var bodyJson = JSON.parse(body);
                expect(bodyJson.error).to.equal(true);
                done();
            });
        });

        it("Tries to register with invalid credentials - 2", function(done) {
            sendRequest('/data/object', 'POST', {username: "asdvx123123", password: "cxbvxbasd123", key: "str", value: "somestring"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(401);
                var bodyJson = JSON.parse(body);
                expect(bodyJson.error).to.equal(true);
                done();
            });
        });

        it("Tries to register with a correct username and wrong password - 1", function(done) {
            sendRequest('/data/object', 'POST', {username: randomValidUsername, password: "aaaaaaaaaaaa", key: "str", value: "somestring"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(401);
                var bodyJson = JSON.parse(body);
                expect(bodyJson.error).to.equal(true);
                done();
            });
        });

        it("Tries to register with a correct username and wrong password - 2", function(done) {
            sendRequest('/data/object', 'POST', {username: randomValidUsername, password: "''''''''''", key: "str", value: "somestring"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(401);
                var bodyJson = JSON.parse(body);
                expect(bodyJson.error).to.equal(true);
                done();
            });
        });

        it("Tries to register with a correct password and wrong username - 1", function(done) {
            sendRequest('/data/object', 'POST', {username: "aaaaaaaaaaaa", password: randomValidUsername, key: "str", value: "somestring"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(401);
                var bodyJson = JSON.parse(body);
                expect(bodyJson.error).to.equal(true);
                done();
            });
        });

        it("Tries to register with a correct password and wrong username - 2", function(done) {
            sendRequest('/data/object', 'POST', {username: "''''''''''", password: randomValidUsername, key: "str", value: "somestring"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(401);
                var bodyJson = JSON.parse(body);
                expect(bodyJson.error).to.equal(true);
                done();
            });
        });

        
        it("Tries to register with a correct password and correct username", function(done) {
            sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, key: "str", value: "somestring"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson.error).to.equal(false);
                done();
            });
        });
    });

    describe("Missing Parameter Login Tries", function(){
        it("Tries to register with a correct username and no password", function(done) {
            sendRequest('/data/object', 'POST', {username: randomValidUsername, password: null, key: "str", value: "somestring"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(400);
                var bodyJson = JSON.parse(body);
                expect(bodyJson.error).to.equal(true);
                done();
            });
        });
        
        it("Tries to register with a correct password and no username", function(done) {
            sendRequest('/data/object', 'POST', {username: null, password: randomValidPassword, key: "str", value: "somestring"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(400);
                var bodyJson = JSON.parse(body);
                expect(bodyJson.error).to.equal(true);
                done();
            });
        });
    });
});