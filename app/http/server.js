const express = require('express');
const Users = require('../logic/users');

function buildApp(config) {
    var app = express()
    app.locals.config = config;
    
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
        var app = buildApp(config);
        app.locals.users = new Users(db);
        console.log("Server Listening on localhost:" + app.locals.config.port);
        app.listen(app.locals.config.port);        
    }
};