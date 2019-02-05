let http = require('./http/server');
let websockets = require('./websockets/server');
let db = require('./database');
let config = require('./config');

//database initiate instructions
/*
    mongod --dbpath DB_FILES_PATH --replSet "REPLICA_SET_NAME" --port PORT
    mongo
        REPLICA_SET_NAME.initiate()

*/
db.initDatabaseConnection(config.mongodb_url, function(err, db) {
    if(!err) {
        http.startHttpServer(db, config);
        websockets.startWebsocketsServer(db, config);
    } else {
        console.log("Database init error");
    }
}, function(username, update) {
    console.log("Something was updated for user: " + username);
    console.log(update);
});
