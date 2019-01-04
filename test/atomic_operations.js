var expect = require("chai").expect;
var randomstring = require('randomstring');

var sendRequest = require('./base_api_request')
var config = require('../app/config')

describe("Atomic Object Operations", function() {
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
    });

    describe("increment operations", function() {
        it("Set item to 0 and fetches it", function(done) {
            sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, key: "SomeKey", value: 0}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                sendRequest('/data/object', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "SomeKey"}, function(err, response, body) {                
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(false);
                    expect(bodyJson.result['SomeKey']).to.equal(0);
                    done();
                });
            });
        });

        it("Increments the last set key (from 0 to 1) and fetches it", function(done) {
            sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "SomeKey", action: "inc"}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result).to.not.equal(null);
                expect(bodyJson.result['SomeKey']).to.equal(1);
                done();
            });
        });

        it("Increments a new key by 5 and fetches it", function(done) {
            sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "newkey", action: "inc", value: 5}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result).to.not.equal(null);
                expect(bodyJson.result['newkey']).to.equal(5);
                done();
            });
        });
    });

    
    describe("decrement operations", function() {
        it("Set item to 10 and fetches it", function(done) {
            sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, key: "SomeKeyD", value: 10}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                sendRequest('/data/object', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "SomeKeyD"}, function(err, response, body) {                
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(false);
                    expect(bodyJson.result['SomeKeyD']).to.equal(10);
                    done();
                });
            });
        });

        it("Increments the last set key (from 0 to 1) and fetches it", function(done) {
            sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "SomeKeyD", action: "dec"}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result).to.not.equal(null);
                expect(bodyJson.result['SomeKeyD']).to.equal(9);
                done();
            });
        });

        it("Increments a new key by 5 and fetches it", function(done) {
            sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "newkeyD", action: "dec", value: 5}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result).to.not.equal(null);
                expect(bodyJson.result['newkeyD']).to.equal(-5);
                done();
            });
        });
    });
});