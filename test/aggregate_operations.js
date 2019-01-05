var expect = require("chai").expect;
var randomstring = require('randomstring');

var sendRequest = require('./base_api_request')
var config = require('../app/config')

function postElement(username, pass, key, value, callback) {
    sendRequest('/data/collection', 'POST', {username: username, password: pass, collection_key: key, value: value}, function(err, response, body) {                
        expect(err).to.equal(null);
        expect(response.statusCode).to.equal(200);
        var bodyJson = JSON.parse(body);
        expect(bodyJson).to.not.equal(null);
        expect(bodyJson.error).to.equal(false);
        callback();
    });
}

describe("Aggregate Object Operations", function() {
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

    it("Pushes raw test elements", function(done) {
        postElement(randomValidUsername, randomValidPassword, "raw", -2, function() {
            postElement(randomValidUsername, randomValidPassword, "raw", 2, function() {
                postElement(randomValidUsername, randomValidPassword, "raw", 8, function() {
                    postElement(randomValidUsername, randomValidPassword, "raw", 4, function() {
                        postElement(randomValidUsername, randomValidPassword, "raw", 5, function() {
                            postElement(randomValidUsername, randomValidPassword, "raw", 6, function() {
                                postElement(randomValidUsername, randomValidPassword, "raw", 10, function() {
                                    done();
                                })
                            })
                        })
                    })
                })
            })
        })
    })

    it("Pushes complex test elements", function(done) {
        postElement(randomValidUsername, randomValidPassword, "complex", {name: "A", age: 12}, function() {
            postElement(randomValidUsername, randomValidPassword, "complex", {name: "B", age: 21}, function() {
                postElement(randomValidUsername, randomValidPassword, "complex", {name: "C", age: 23}, function() {
                    postElement(randomValidUsername, randomValidPassword, "complex", {name: "D", age: 42}, function() {
                        postElement(randomValidUsername, randomValidPassword, "complex", {name: "E", age: 31}, function() {
                            postElement(randomValidUsername, randomValidPassword, "complex", {name: "F", age: 22}, function() {
                                postElement(randomValidUsername, randomValidPassword, "complex", {name: "G", age: 11}, function() {
                                    done();
                                })
                            })
                        })
                    })
                })
            })
        })
    })

    describe("Min and Max elements with raw data", function() {
        it("Gets the max value and compares it to 10", function(done) {
            sendRequest('/data/collection/aggregate', 'GET', {username: randomValidUsername, password: randomValidPassword, 
                                                     collection_key: "raw", action: "max"}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result).to.not.equal(true);
                expect(bodyJson.result).to.equal(10);
                done();
            });
        });

        it("Gets the min value and compares it to -2", function(done) {
            sendRequest('/data/collection/aggregate', 'GET', {username: randomValidUsername, password: randomValidPassword, 
                                                     collection_key: "raw", action: "min"}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result).to.not.equal(true);
                expect(bodyJson.result).to.equal(-2);
                done();
            });
        });
    });

    
    describe("Min and Max elements with complex data", function() {
        it("Gets the max value and compares it to {name: D, age: 42}", function(done) {
            sendRequest('/data/collection/aggregate', 'GET', {username: randomValidUsername, password: randomValidPassword, 
                                                     collection_key: "complex", subkey: "age", action: "max"}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result).to.not.equal(true);
                expect(bodyJson.result).to.deep.equal({name: "D", age: 42});
                done();
            });
        });

        it("Gets the min value and compares it to {name: G, age: 11}", function(done) {
            sendRequest('/data/collection/aggregate', 'GET', {username: randomValidUsername, password: randomValidPassword, 
                                                     collection_key: "complex", subkey: "age", action: "min"}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result).to.not.equal(true);
                expect(bodyJson.result).to.deep.equal({name: "G", age: 11});
                done();
            });
        });
    });
    

});