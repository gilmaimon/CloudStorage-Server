const express = require('express');
const wsroutes = require('express-ws-routes');

const Users = require('../logic/users');
let Session = require('./session/session')

let SessionsManager = require('./session/sessions_manager')
let manager = new SessionsManager();

function buildApp(config, db) {
    var app = wsroutes();
    app.locals.config = config;
    app.locals.users = new Users(db);

    app.websocket(config.listen_route, function(info, cb, next) {
        cb(function(connection) {
            var session = new Session(app.locals.users, connection, manager);
            manager.onNewSession(session);
        })
    });
    
    // Middlewares
    require('./middlewares/logger/logger').attach(app);
    require('./middlewares/parsers/parsers').attach(app);
    require('./middlewares/limiters/limiters').attach(app);
    require('./middlewares/logger/request_logger').attach(app);
    require('./middlewares/validators/validators').attach(app);
    
    // Routes
    require('./routes/objects/objects_route').use(app);
    require('./routes/collections/collections_route').use(app);
    if(app.locals.config.test_routes) require('./routes/home/home_route').use(app);
    if(app.locals.config.allow_registering) require('./routes/register/register_route').use(app);
    
    return app;
}

module.exports = {
    startHttpServer: function(db, config) {
        var app = buildApp(config, db);
        console.log("Server Listening on localhost:" + app.locals.config.port);
        let server = app.listen(app.locals.config.port);
        return () => server.close();       
    },
    onUpdate: function(username, changedKey, newValue) {
      manager.notifyKeyChanged(username, changedKey, newValue);
    }
};