var http = require('http');
var WebSocketServer = require('websocket').server;

let Users = require('../logic/users');
let Session = require('./session/session')

var server = http.createServer(function(request, response) {});
wsServer = new WebSocketServer({httpServer: server});

let SessionsManager = require('./sessions_manager')
let manager = new SessionsManager();

wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  var session = new Session(users, connection, manager);
  manager.onNewSession(session);
});

let users;
module.exports = {
  startWebsocketsServer: function(db, config) {
    users = new Users(db);
    server.listen(config.web_sockets_port, function() {});
    return () => server.close();
  },
  onUpdate: function(username, changedKey, newValue) {
    manager.notifyKeyChanged(username, changedKey, newValue);
  }
}
