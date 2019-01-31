var config = require('../app/config')
var request = require('request')

var base_url = "http://localhost:" + config.port;
module.exports = function sendRequest(path, method, bodyJson, callback) {
    request({
        uri: base_url + path,
        method: method,
        body: JSON.stringify(bodyJson),
        headers: {
            'Content-Type': 'application/json'
        }
    }, callback);
}

before(function(done) {
    server = require('../app/http/server').startHttpServer(function(e) {
        done();
    });
})

after(function(done) {
    process.exit();
    done();
})