var expect = require("chai").expect;
var randomstring = require('randomstring');

var sendRequest = require('./base_api_request')
var config = require('../app/config')

describe("Single Object Operations", function() {
    var randomValidUsername = randomstring.generate({ length: 12, charset: 'alphabetic' });
    var randomValidPassword = randomstring.generate({ length: 12, charset: 'alphabetic' });

    before(function(done) {
        sendRequest('/user/register', 'POST', {username: randomValidUsername, password: randomValidPassword}, function(err, response, body) {                
            expect(err).to.equal(null);
            expect(response.statusCode).to.equal(200);
            var bodyJson = JSON.parse(body);
            expect(bodyJson).to.not.equal(null);
            expect(bodyJson.error).to.equal(false);
            done();
        });
    })

    describe("Invalid requests", function() {
        it("Tries to store a value without a key", function(done) {
            sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, value: "somestring"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(400);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.not.equal(false);
                done();
            });
        });

        it("Tries to store a value without a value", function(done) {
            sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, key: "somekey"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(400);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.not.equal(false);
                done();
            });
        });

        it("Tries to fetch a value without a key", function(done) {
            sendRequest('/data/object', 'GET', {username: randomValidUsername, password: randomValidPassword}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(400);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.not.equal(false);
                done();
            });
        });
    });

    describe("Single Object Storage - String", function() {
        it("Should store a string", function(done) {
            sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, key: "str", value: "somestring"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                done();
            });
        });

        it("Should fetch a string", function(done) {
            sendRequest('/data/object', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "str"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result.str).to.not.equal(null);
                expect(typeof(bodyJson.result.str)).to.equal(typeof(""));
                expect(bodyJson.result.str).to.equal("somestring");
                done();
            });
        });
    });

    describe("Single Object Storage - Integer", function() {
        it("Should store an int", function(done) {
            sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, key: "integer", value: 12345}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                done();
            });
        });

        it("Should fetch an int", function(done) {
            sendRequest('/data/object', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "integer"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result.integer).to.not.equal(null);
                expect(typeof(bodyJson.result.integer)).to.equal(typeof(12345));
                expect(bodyJson.result.integer).to.equal(12345);
                done();
            });
        });
    });

    describe("Single Object Storage - Object", function() {
        it("Should store an object", function(done) {
            sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, key: "name", value: {first: "Gil", last: "Maimon" }}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                done();
            });
        });

        it("Should fetch an object", function(done) {
            sendRequest('/data/object', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "name"}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result.name).to.not.equal(null);
                expect(typeof(bodyJson.result.name)).to.equal(typeof({}));

                expect(bodyJson.result.name.first).to.not.equal(null);
                expect(bodyJson.result.name.first).to.equal("Gil");

                expect(bodyJson.result.name.last).to.not.equal(null);
                expect(bodyJson.result.name.last).to.equal("Maimon");

                expect(bodyJson.result.name).to.deep.equal({first: "Gil", last: "Maimon" });
                done();
            });
        });
    });
})