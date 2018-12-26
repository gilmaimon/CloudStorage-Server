const express = require('express');

const Users = require('./database-helpers/users');

const Middlwares = require('./middleware/middlewares');
const Routes = require('./routes');

var app = express()
app.locals.config = require('./config');

Middlwares.AttachMiddlewares(app);
Routes.SetupRoutes(app);

module.exports = {start: function() {
    // Connect to databae and run server
    var db = require('./database-helpers/database');
    db.initDatabaseConnection(app.locals.config.mongodb_url, function(err, db) {
        if(!err) {
            app.locals.users = new Users(db);
            console.log("Server Listening on localhost:" + app.locals.config.port);
            app.listen(app.locals.config.port, '0.0.0.0');
        } else {
            console.log("Database init error");
        }
    });
    return app;
}};