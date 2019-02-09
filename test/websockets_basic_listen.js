var expect = require("chai").expect;
var randomstring = require('randomstring');

var sendRequest = require('./base_api_request')
var config = require('../app/config')
var WebSocketClient = require('websocket').client;

describe("Websockets Basic Listening", function() {
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

    describe("Single key Listening scenarios", function() {
        it("Listenes to a key, changes it with http and checks for an update", function(done) {
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
                        expect(bodyJson.message).to.not.equal(null);
    
                        // listen to key 'name'
                        connection.send(JSON.stringify({
                            type: "listen",
                            key: "name"
                        }));
    
                        state = 'LISTEN_SENT';
    
                    } else if(state == 'LISTEN_SENT') {
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('listen');
                        expect(bodyJson.message).to.not.equal(null);
                        
                        sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, key: "name", value: "Tapud"}, function(err, response, body) {
                            expect(err).to.equal(null);
                            expect(response.statusCode).to.equal(200);
                            var bodyJson = JSON.parse(body);
                            expect(bodyJson).to.not.equal(null);
                            expect(bodyJson.error).to.equal(false);
                            state = 'UPDATED_VIA_HTTP';
                        });
                    } else if(state == 'UPDATED_VIA_HTTP') {
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('value-changed');
                        expect(bodyJson.result).to.not.equal(null);
                        expect(bodyJson.result.key).to.equal('name');
                        expect(bodyJson.result.value).to.equal('Tapud');

                        done();
                    }
                });
            });
            
            client.connect(`ws://localhost:${config.web_sockets_port}/`);
        })
        it("Listenes to to a parent and gets update for child", function(done) {
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
                        expect(bodyJson.message).to.not.equal(null);
    
                        // listen to key 'name'
                        connection.send(JSON.stringify({
                            type: "listen",
                            key: "parent"
                        }));
    
                        state = 'LISTEN_SENT';
    
                    } else if(state == 'LISTEN_SENT') {
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('listen');
                        expect(bodyJson.message).to.not.equal(null);
                        
                        sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, key: "parent.child1", value: "ChildValue"}, function(err, response, body) {
                            expect(err).to.equal(null);
                            expect(response.statusCode).to.equal(200);
                            var bodyJson = JSON.parse(body);
                            expect(bodyJson).to.not.equal(null);
                            expect(bodyJson.error).to.equal(false);
                            state = 'UPDATED_VIA_HTTP';
                        });
                    } else if(state == 'UPDATED_VIA_HTTP') {
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('value-changed');
                        expect(bodyJson.result).to.not.equal(null);
                        expect(bodyJson.result.key).to.equal('parent.child1');
                        expect(bodyJson.result.value).to.equal('ChildValue');

                        done();
                    }
                });
            });
            
            client.connect(`ws://localhost:${config.web_sockets_port}/`);
        })
    })

    describe("Joker key listening", function() {
        it("Listenes for joker and get updates for keys 'name' and 'age' and 'temperture'", function(done) {
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
                        expect(bodyJson.message).to.not.equal(null);
    
                        // listen to key 'name'
                        connection.send(JSON.stringify({
                            type: "listen",
                            key: "*"
                        }));
    
                        state = 'LISTEN_SENT';
    
                    } else if(state == 'LISTEN_SENT') {
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('listen');
                        expect(bodyJson.message).to.not.equal(null);
                        
                        sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, key: "name2", value: "Gil"}, function(err, response, body) {
                            expect(err).to.equal(null);
                            expect(response.statusCode).to.equal(200);
                            var bodyJson = JSON.parse(body);
                            expect(bodyJson).to.not.equal(null);
                            expect(bodyJson.error).to.equal(false);
                            state = 'UPDATED_VIA_HTTP_1';
                        });
                    } else if(state == 'UPDATED_VIA_HTTP_1') {
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('value-changed');
                        expect(bodyJson.result).to.not.equal(null);
                        expect(bodyJson.result.key).to.equal('name2');
                        expect(bodyJson.result.value).to.equal('Gil');

                        sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, key: "age", value: 120}, function(err, response, body) {
                            expect(err).to.equal(null);
                            expect(response.statusCode).to.equal(200);
                            var bodyJson = JSON.parse(body);
                            expect(bodyJson).to.not.equal(null);
                            expect(bodyJson.error).to.equal(false);
                            state = 'UPDATED_VIA_HTTP_2';
                        });
                    } else if(state == 'UPDATED_VIA_HTTP_2') {
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('value-changed');
                        expect(bodyJson.result).to.not.equal(null);
                        expect(bodyJson.result.key).to.equal('age');
                        expect(bodyJson.result.value).to.equal(120);
                        
                        sendRequest('/data/object', 'POST', {username: randomValidUsername, password: randomValidPassword, key: "temperture", value: 37.6}, function(err, response, body) {
                            expect(err).to.equal(null);
                            expect(response.statusCode).to.equal(200);
                            var bodyJson = JSON.parse(body);
                            expect(bodyJson).to.not.equal(null);
                            expect(bodyJson.error).to.equal(false);
                            state = 'UPDATED_VIA_HTTP_3';
                        });
                    } else if(state == 'UPDATED_VIA_HTTP_3') {
                        expect(bodyJson.error).to.equal(false);
                        expect(bodyJson.type).to.equal('value-changed');
                        expect(bodyJson.result).to.not.equal(null);
                        expect(bodyJson.result.key).to.equal('temperture');
                        expect(bodyJson.result.value).to.equal(37.6);
                        done();
                    }
                });
            });
            
            client.connect(`ws://localhost:${config.web_sockets_port}/`);
        })
    })
    
})