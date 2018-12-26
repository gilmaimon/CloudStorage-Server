const express = require('express');

const Users = require('./database-helpers/users');
const config = require('./config');

const Middlwares = require('./middleware/middlewares');
const Routes = require('./routes');

var app = express()
Middlwares.AttachMiddlewares(app, config);
Routes.SetupRoutes(app, config);

// Connect to databae and run server
var db = require('./database-helpers/database');
db.initDatabaseConnection(config.mongodb_url, function(err, db) {
    if(!err) {
        app.locals.users = new Users(db);
        console.log("Server Listening on localhost:" + config.port);
        app.listen(config.port, '0.0.0.0');
    } else {
        console.log("Database init error");
    }
});