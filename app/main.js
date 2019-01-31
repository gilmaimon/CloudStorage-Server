let http = require('./http/server');
let websockets = require('./websockets/server');
let db = require('./database');
let config = require('./config');

db.initDatabaseConnection(config.mongodb_url, function(err, db) {
    if(!err) {
        http.startHttpServer(db, config);
        websockets.startWebsocketsServer(db, config);
    } else {
        console.log("Database init error");
    }
});
