const express = require('express');

const Users = require('../logic/users');
var app = express()
app.locals.config = require('../config');

// Middlewares
require('./middlewares/logger/logger').attach(app);
require('./middlewares/parsers/parsers').attach(app);
require('./middlewares/limiters/limiters').attach(app);
require('./middlewares/logger/request_logger').attach(app);
require('./middlewares/validators/validators').attach(app);

// Routes
require('./routes/objects/objects_route').use(app);
require('./routes/collections/collections_route').use(app);
if(app.locals.config.test_routes) {
    require('./routes/home/home_route').use(app);
}
if(app.locals.config.allow_registering) {
    require('./routes/register/register_route').use(app);
}



module.exports = {
    startHttpServer: function(callback) {
        // Connect to database and run server
        let db = require('../database');
        db.initDatabaseConnection(app.locals.config.mongodb_url, function(err, db) {
            if(!err) {
                app.locals.users = new Users(db);
                console.log("Server Listening on localhost:" + app.locals.config.port);
                app.listen(app.locals.config.port);
                if(callback) callback(false);
            } else {
                console.log("Database init error");
                if(callback) callback(true);
            }
        });
    }
};