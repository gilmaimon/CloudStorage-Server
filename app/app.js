const express = require('express');

const Users = require('./database-helpers/users');

const Middlwares = require('./middleware/middlewares');
const Routes = require('./routes');

var app = express()
app.locals.config = require('./config');

Middlwares.AttachMiddlewares(app);
Routes.SetupRoutes(app);

module.exports = {
    start: function(callback) {
        // Connect to databae and run server
        var dbHelper = require('./database-helpers/database');
        dbHelper.initDatabaseConnection(app.locals.config.mongodb_url, function(err, db) {
            if(!err) {
                app.locals.users = new Users(db);
                console.log("Server Listening on localhost:" + app.locals.config.port);
                var server = app.listen(app.locals.config.port);
                if(callback) callback(function() {
                    server.close();
                });
            } else {
                console.log("Database init error");
                if(callback) callback(null);
            }
        });
    }
};