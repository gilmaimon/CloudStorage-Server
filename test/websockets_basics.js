var expect = require("chai").expect;
var randomstring = require('randomstring');

var sendRequest = require('./base_api_request')
var config = require('../app/config')
var WebSocketClient = require('websocket').client;

describe("Websockets Basic Operations", function() {
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

    describe("Login Scenarios", function() {
        it("Tries to login with correct credentials", function(done) {
            let state = 'READY';
            var client = new WebSocketClient();
            client.on('connectFailed', (error) => expect(error).to.deep.equal(null));
            
            client.on('connect', function(connection) {
                connection.on('error', function(error) {});
                connection.on('close', function() {});
                connection.on('message', function(message) {
                    expect(message.type).to.deep.equal('utf8');
                    let bodyJson = JSON.parse(message.utf8Data);
                    expect(bodyJson).to.not.equal(null);

                    expect(bodyJson.error).to.not.equal(null);
                    expect(bodyJson.type).to.not.equal(null);

                    if(state == 'READY') {
                        // this is the initial state. the server just sends a ready message
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('ready');
                        
                        // send a login message with correct credentials
                        connection.send(JSON.stringify({
                            type: "login",
                            username: randomValidUsername,
                            password: randomValidPassword
                        }));
                        state = 'SENT_CORRECT_LOGIN';
                    } else if(state == 'SENT_CORRECT_LOGIN') {
                        // we expect the server to respond with ok message (we succesfully logged in)
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('login');
                        expect(bodyJson.result).to.equal(undefined);
                        expect(bodyJson.message).to.not.equal(null);
                        done();
                    }
                });
            });
            
            client.connect(`ws://localhost:${config.web_sockets_port}/`);
        })
        it("Tries to login with BAD credentials", function(done) {
            let state = 'READY';
            var client = new WebSocketClient();
            client.on('connectFailed', (error) => expect(error).to.deep.equal(null));
            
            client.on('connect', function(connection) {
                connection.on('error', function(error) {});
                connection.on('close', function() {});
                connection.on('message', function(message) {
                    expect(message.type).to.deep.equal('utf8');
                    let bodyJson = JSON.parse(message.utf8Data);
                    expect(bodyJson).to.not.equal(null);

                    expect(bodyJson.error).to.not.equal(null);
                    expect(bodyJson.type).to.not.equal(null);

                    if(state == 'READY') {
                        // this is the initial state. the server just sends a ready message
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('ready');
                        
                        // send a login message with correct credentials
                        connection.send(JSON.stringify({
                            type: "login",
                            username: randomValidUsername + 'aaa',
                            password: randomValidPassword
                        }));
                        state = 'SENT_BAD_LOGIN';
                    } else if(state == 'SENT_BAD_LOGIN') {
                        // we expect the server to respond with bad message (we unsuccesfully logged in)
                        expect(bodyJson.error).to.equal(true);
                        expect(bodyJson.type).to.equal('login');
                        expect(bodyJson.message).to.not.equal(null);
                        done();
                    }
                });
            });
            
            client.connect(`ws://localhost:${config.web_sockets_port}/`);
        })
    });

    describe("Bad Requests", function() {
        it("Sends a listen request before login", function(done) {
            let state = 'READY';
            var client = new WebSocketClient();
            client.on('connectFailed', (error) => expect(error).to.deep.equal(null));
            
            client.on('connect', function(connection) {
                connection.on('error', function(error) {});
                connection.on('close', function() {});
                connection.on('message', function(message) {
                    expect(message.type).to.deep.equal('utf8');
                    let bodyJson = JSON.parse(message.utf8Data);
                    expect(bodyJson).to.not.equal(null);

                    expect(bodyJson.error).to.not.equal(null);
                    expect(bodyJson.type).to.not.equal(null);

                    if(state == 'READY') {
                        // this is the initial state. the server just sends a ready message
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('ready');
                        
                        // send a login message with correct credentials
                        connection.send(JSON.stringify({
                            type: "listen",
                            username: randomValidUsername,
                            password: randomValidPassword,
                            key: "Hello"
                        }));
                        state = 'SENT_LISTEN_REQUEST';
                    } else if(state == 'SENT_LISTEN_REQUEST') {
                        // we expect the server to respond with error message (we are not logged in)
                        expect(bodyJson.error).to.equal(true);
                        expect(bodyJson.type).to.equal('unknown-command');
                        expect(bodyJson.result).to.equal(undefined);
                        expect(bodyJson.message).to.not.equal(null);
                        done();
                    }
                });
            });
            
            client.connect(`ws://localhost:${config.web_sockets_port}/`);
        })
        it("Sends a non-json request", function(done) {
            let state = 'READY';
            var client = new WebSocketClient();
            client.on('connectFailed', (error) => expect(error).to.deep.equal(null));
            
            client.on('connect', function(connection) {
                connection.on('error', function(error) {});
                connection.on('close', function() {});
                connection.on('message', function(message) {
                    expect(message.type).to.deep.equal('utf8');
                    let bodyJson = JSON.parse(message.utf8Data);
                    expect(bodyJson).to.not.equal(null);

                    expect(bodyJson.error).to.not.equal(null);
                    expect(bodyJson.type).to.not.equal(null);

                    if(state == 'READY') {
                        // this is the initial state. the server just sends a ready message
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('ready');
                        
                        // send a UTF8 (but not json) message
                        connection.send("Hello Server");
                        state = 'SENT_UTF8_COMMAND';
                    } else if(state == 'SENT_UTF8_COMMAND') {
                        // we expect the server to respond with error message (we are not logged in)
                        expect(bodyJson.error).to.equal(true);
                        expect(bodyJson.type).to.equal('bad-request');
                        expect(bodyJson.result).to.equal(undefined);
                        expect(bodyJson.message).to.not.equal(null);
                        done();
                    }
                });
            });
            
            client.connect(`ws://localhost:${config.web_sockets_port}/`);
        })     
        it("Logins and send an unkown command", function(done) {
            let state = 'READY';
            var client = new WebSocketClient();
            client.on('connectFailed', (error) => expect(error).to.deep.equal(null));
            
            client.on('connect', function(connection) {
                connection.on('error', function(error) {});
                connection.on('close', function() {});
                connection.on('message', function(message) {
                    expect(message.type).to.deep.equal('utf8');
                    let bodyJson = JSON.parse(message.utf8Data);
                    expect(bodyJson).to.not.equal(null);

                    expect(bodyJson.error).to.not.equal(null);
                    expect(bodyJson.type).to.not.equal(null);

                    if(state == 'READY') {
                        // this is the initial state. the server just sends a ready message
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('ready');
                        
                        // send a login message with correct credentials
                        connection.send(JSON.stringify({
                            type: "login",
                            username: randomValidUsername,
                            password: randomValidPassword
                        }));
                        state = 'SENT_CORRECT_LOGIN';
                    } else if(state == 'SENT_CORRECT_LOGIN') {
                        // we expect the server to respond with ok message (we succesfully logged in)
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('login');
                        expect(bodyJson.result).to.equal(undefined);
                        expect(bodyJson.message).to.not.equal(null);

                        connection.send(JSON.stringify({
                            type: "naharda",
                            username: randomValidUsername,
                            password: randomValidPassword
                        }));

                        state = 'SENT_UNKNOWN_COMMAND'
                    } else if(state == 'SENT_UNKNOWN_COMMAND') {
                        expect(bodyJson.error).to.equal(true);
                        expect(bodyJson.type).to.equal('unknown-command');
                        expect(bodyJson.result).to.equal(undefined);
                        expect(bodyJson.message).to.not.equal(null);
                        done();
                    }
                });
            });
            
            client.connect(`ws://localhost:${config.web_sockets_port}/`);
        })

    });
})