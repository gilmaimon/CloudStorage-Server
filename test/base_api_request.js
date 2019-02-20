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

let http = require('../app/http/server');
let db = require('../app/database');
let cleanup;
before(function(done) {
    db.initDatabaseConnection(config.mongodb_url, function(err, db, client) {
        if(!err) {
            let httpStopHandle = http.startHttpServer(db, config);
            cleanup = function() {
                httpStopHandle();
                client.close();
            }
        } else {
            console.log("Database init error");
        }
    }, function(username, updates) {
        Object.keys(updates).forEach(function(key) {
            if(key.startsWith('data.')) {
                let itemKey = key.substr('data.'.length);
                let newValue = updates[key];
                http.onUpdate(username, itemKey, newValue);
            }
        });
    });

    // Give server some time to start
    setTimeout(() => done(), 1500);
})

after(function(done) {
    cleanup();
    done();
})