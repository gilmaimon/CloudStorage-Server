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

        it("Decrement the last key by 1 and fetch it (Should be 9)", function(done) {
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

        it("Decrements a new key by 5 and fetches it", function(done) {
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

    describe("multiply operations", function() {
        it("Set item to 3 and fetches it", function(done) {
            sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, key: "SomeKeyM", value: 3}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                sendRequest('/data/object', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "SomeKeyM"}, function(err, response, body) {                
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(false);
                    expect(bodyJson.result['SomeKeyM']).to.equal(3);
                    done();
                });
            });
        });

        it("Multiply by default (2) the last set key (from 3 to 6) and fetches it", function(done) {
            sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "SomeKeyM", action: "mul"}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result).to.not.equal(null);
                expect(bodyJson.result['SomeKeyM']).to.equal(6);
                done();
            });
        });
        
        it("Multiply by 10 the last set key (from 6 to 60) and fetches it", function(done) {
            sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "SomeKeyM", action: "mul", value: 10}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result).to.not.equal(null);
                expect(bodyJson.result['SomeKeyM']).to.equal(60);
                done();
            });
        });

        it("Multiplies a new key by 5 and fetches it", function(done) {
            sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "newkeyM", action: "mul", value: 5}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result).to.not.equal(null);
                expect(bodyJson.result['newkeyM']).to.equal(0);
                done();
            });
        });

        describe("MinMax operations", function() {
            it("Set item to 10 and fetches it", function(done) {
                sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, key: "k", value: 10}, function(err, response, body) {                
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(false);
                    sendRequest('/data/object', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "k"}, function(err, response, body) {                
                        expect(err).to.equal(null);
                        expect(response.statusCode).to.equal(200);
                        var bodyJson = JSON.parse(body);
                        expect(bodyJson).to.not.equal(null);
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.result['k']).to.equal(10);
                        done();
                    });
                });
            });

            
            it("Tries to use max without a value", function(done) {
                sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "k", action: "max"}, function(err, response, body) {                
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(400);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.not.equal(false);
                    done();
                });
            });            
            it("Tries to use min without a value", function(done) {
                sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "k", action: "min"}, function(err, response, body) {                
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(400);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.not.equal(false);
                    done();
                });
            });

            it("Successfully maxes value with 100", function(done) {
                sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "k", action: "max", value: 100}, function(err, response, body) {                
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(false);
                    expect(bodyJson.result.k).to.not.equal(null);
                    expect(bodyJson.result.k).to.equal(100);
                    done();
                });
            });

            it("Successfully maxes value with 101", function(done) {
                sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "k", action: "max", value: 101}, function(err, response, body) {                
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(false);
                    expect(bodyJson.result.k).to.not.equal(null);
                    expect(bodyJson.result.k).to.equal(101);
                    done();
                });
            });

            
            it("Successfully tries to max value with 90", function(done) {
                sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "k", action: "max", value: 90}, function(err, response, body) {                
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(false);
                    expect(bodyJson.result.k).to.not.equal(null);
                    expect(bodyJson.result.k).to.equal(101);
                    done();
                });
            });
                        
            it("Successfully mins value with 90", function(done) {
                sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "k", action: "min", value: 90}, function(err, response, body) {                
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(false);
                    expect(bodyJson.result.k).to.not.equal(null);
                    expect(bodyJson.result.k).to.equal(90);
                    done();
                });
            });

                                    
            it("Successfully mins value with -100", function(done) {
                sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "k", action: "min", value: -100}, function(err, response, body) {                
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(false);
                    expect(bodyJson.result.k).to.not.equal(null);
                    expect(bodyJson.result.k).to.equal(-100);
                    done();
                });
            });

                                                
            it("Successfully tries to min value with -1", function(done) {
                sendRequest('/data/object/atomic', 'GET', {username: randomValidUsername, password: randomValidPassword, key: "k", action: "min", value: -1}, function(err, response, body) {                
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(false);
                    expect(bodyJson.result.k).to.not.equal(null);
                    expect(bodyJson.result.k).to.equal(-100);
                    done();
                });
            });

        })
    });

});