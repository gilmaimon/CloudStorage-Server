var expect = require("chai").expect;
var randomstring = require('randomstring');

var sendRequest = require('./base_api_request')
var config = require('../app/config')

describe("Collection Operations", function() {
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
            sendRequest('/data/collection', 'POST', {username: randomValidUsername, password: randomValidPassword, value: "somestring"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(400);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.not.equal(false);
                done();
            });
        });

        it("Tries to store a value without a value", function(done) {
            sendRequest('/data/collection', 'POST', {username: randomValidUsername, password: randomValidPassword, collection_key: "somekey"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(400);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.not.equal(false);
                done();
            });
        });

        it("Tries to fetch a value without a key", function(done) {
            sendRequest('/data/collection', 'GET', {username: randomValidUsername, password: randomValidPassword}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(400);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.not.equal(false);
                done();
            });
        });
    });

    describe("Collection Building", function() {
        it("Adding items to a collection", function(done) {
            sendRequest('/data/collection', 'POST', {username: randomValidUsername, password: randomValidPassword, collection_key: "collkey", value: 1}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                sendRequest('/data/collection', 'POST', {username: randomValidUsername, password: randomValidPassword, collection_key: "collkey", value: 2}, function(err, response, body) {
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(false);
                    sendRequest('/data/collection', 'POST', {username: randomValidUsername, password: randomValidPassword, collection_key: "collkey", value: 3}, function(err, response, body) {
                        expect(err).to.equal(null);
                        expect(response.statusCode).to.equal(200);
                        var bodyJson = JSON.parse(body);
                        expect(bodyJson).to.not.equal(null);
                        expect(bodyJson.error).to.equal(false);
                        sendRequest('/data/collection', 'POST', {username: randomValidUsername, password: randomValidPassword, collection_key: "collkey", value: 4}, function(err, response, body) {
                            expect(err).to.equal(null);
                            expect(response.statusCode).to.equal(200);
                            var bodyJson = JSON.parse(body);
                            expect(bodyJson).to.not.equal(null);
                            expect(bodyJson.error).to.equal(false);
                            sendRequest('/data/collection', 'POST', {username: randomValidUsername, password: randomValidPassword, collection_key: "collkey", value: 5}, function(err, response, body) {
                                expect(err).to.equal(null);
                                expect(response.statusCode).to.equal(200);
                                var bodyJson = JSON.parse(body);
                                expect(bodyJson).to.not.equal(null);
                                expect(bodyJson.error).to.equal(false);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    describe("Filtering a collection", function() {
        it("Gets the first 3 items of a collection", function(done) {
            sendRequest('/data/collection', 'GET', {username: randomValidUsername, password: randomValidPassword, collection_key: "collkey", limit: 3}, function(err, response, body) {               
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);

                expect(bodyJson.result).to.not.equal(null);
                expect(bodyJson.result.collkey).to.not.equal(null);
                expect(typeof(bodyJson.result.collkey)).to.equal(typeof([]));
                expect(bodyJson.result.collkey.length).to.equal(3);
                expect(bodyJson.result.collkey).to.deep.equal([1, 2, 3]);
                done();
            });
        });

        it("Gets 2 items after the first 2 (limit-2, skip-2) of a collection", function(done) {
            sendRequest('/data/collection', 'GET', {username: randomValidUsername, password: randomValidPassword, collection_key: "collkey", limit: 2, skip: 2}, function(err, response, body) {               
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);

                expect(bodyJson.result).to.not.equal(null);
                expect(bodyJson.result.collkey).to.not.equal(null);
                expect(typeof(bodyJson.result.collkey)).to.equal(typeof([]));
                expect(bodyJson.result.collkey.length).to.equal(2);
                expect(bodyJson.result.collkey).to.deep.equal([3, 4]);
                done();
            });
        });

        it("Gets the last 2 items of a collection", function(done) {
            sendRequest('/data/collection', 'GET', {username: randomValidUsername, password: randomValidPassword, collection_key: "collkey", limit: 2, from_last: true}, function(err, response, body) {                
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);

                expect(bodyJson.result).to.not.equal(null);
                expect(bodyJson.result.collkey).to.not.equal(null);
                expect(typeof(bodyJson.result.collkey)).to.equal(typeof([]));
                expect(bodyJson.result.collkey.length).to.equal(2);
                expect(bodyJson.result.collkey).to.deep.equal([4, 5]);
                done();
            });
        });
    });

    describe("Popping items from a collection", function() {
        it("Pops items from the beginning", function(done) {
            sendRequest('/data/collection/pop', 'GET', {username: randomValidUsername, password: randomValidPassword, collection_key: "collkey", position: "first"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result.value).to.equal(1);
                expect(bodyJson.result.empty).to.equal(false);
                sendRequest('/data/collection/pop', 'GET', {username: randomValidUsername, password: randomValidPassword, collection_key: "collkey", position: "first"}, function(err, response, body) {
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(false);
                    expect(bodyJson.result.value).to.equal(2);
                    expect(bodyJson.result.empty).to.equal(false);
                    done();
                });
            });
        });

        it("Pops items from the beginning", function(done) {
            sendRequest('/data/collection/pop', 'GET', {username: randomValidUsername, password: randomValidPassword, collection_key: "collkey", position: "last"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result.value).to.equal(5);
                expect(bodyJson.result.empty).to.equal(false);
                sendRequest('/data/collection/pop', 'GET', {username: randomValidUsername, password: randomValidPassword, collection_key: "collkey", position: "last"}, function(err, response, body) {
                    expect(err).to.equal(null);
                    expect(response.statusCode).to.equal(200);
                    var bodyJson = JSON.parse(body);
                    expect(bodyJson).to.not.equal(null);
                    expect(bodyJson.error).to.equal(false);
                    expect(bodyJson.result.value).to.equal(4);
                    expect(bodyJson.result.empty).to.equal(false);
                    done();
                });
            });
        });

        it("Pops the last item from a collection", function(done) {
            sendRequest('/data/collection/pop', 'GET', {username: randomValidUsername, password: randomValidPassword, collection_key: "collkey", position: "last"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(false);
                expect(bodyJson.result.value).to.equal(3);
                expect(bodyJson.result.empty).to.equal(true);
                done();
            });
        });

        it("Tries to pop from an empty collection", function(done) {
            sendRequest('/data/collection/pop', 'GET', {username: randomValidUsername, password: randomValidPassword, collection_key: "collkey", position: "last"}, function(err, response, body) {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(400);
                var bodyJson = JSON.parse(body);
                expect(bodyJson).to.not.equal(null);
                expect(bodyJson.error).to.equal(true);
                done();
            });
        });
    })

    
});