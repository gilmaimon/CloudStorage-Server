let http = require('./http/server');
let websockets = require('./websockets/server');
let db = require('./database');
let config = require('./config');

//database initiate instructions
/*
    // to start up replset node
    mongod --dbpath data --replSet "rs" --port 3003

    // first time with replset node
    mongo --port 3003
    rs.initiate()

*/
db.initDatabaseConnection(config.mongodb_url, function(err, db) {
    if(!err) {
        http.startHttpServer(db, config);
        websockets.startWebsocketsServer(db, config);
    } else {
        console.log("Database init error");
    }
}, function(username, updates) {
    Object.keys(updates).forEach(function(key) {
        if(key.startsWith('data.')) {
            let itemKey = key.substr('data.'.length);
            let newValue = updates[key];
            websockets.onUpdate(username, itemKey, newValue);
        }
    });
});
