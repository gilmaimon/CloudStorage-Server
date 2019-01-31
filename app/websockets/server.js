var WebSocketServer = require('websocket').server;
var http = require('http');
var config = require('../config');

var server = http.createServer(function(request, response) {});
server.listen(config.web_sockets_port, function() { });

// create the server
wsServer = new WebSocketServer({
  httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);

  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      // process WebSocket message
    }
  });

  connection.on('close', function(connection) {
    // close user connection
  });
});

module.exports = {
  startWebsocketsServer: function(db, config) {}
}
