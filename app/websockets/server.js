var http = require('http');
var WebSocketServer = require('websocket').server;

let Users = require('../logic/users');
let Session = require('./session')

var server = http.createServer(function(request, response) {});
wsServer = new WebSocketServer({httpServer: server});

let sessions = []
let sessionIdToSession = {}
let sessionIdToKeys = {}
let keysToSessionId = {}

wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  var session = new Session(users, connection);
  sessions.push(session);

  sessionIdToSession[session.sessionId] = session;
});

let users;
module.exports = {
  startWebsocketsServer: function(db, config) {
    users = new Users(db);
    server.listen(config.web_sockets_port, function() {});
  }
}
