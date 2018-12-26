var path = require('path');

// Common response utility
function respond(err, res, result = {}) {
    if(err) {
        res.status(400);
    } else {
        res.status(200);
    }

    res.send({"error": err, "result": result});
}

function SetupTestRoutes(app) {
    app.get('/', function(req, res) {
        res.end(JSON.stringify(req.body));
    });
    app.post('/', function(req, res) {
        res.end(JSON.stringify(req.body));
    });
}

// Single Object Operations
function SetupObjectAccessRoutes(app) {
    app.route('/data/object')
        .get(function (req, res) {
            req.userObj.get(req.body, function(err, result) {
                respond(err, res, result);
            });
        })
        .post(function (req, res) {
            req.userObj.put(req.body, function(err) {
                respond(err, res);
            });
        });
}

// Collections Operations
function SetupCollectionAccessRoutes(app) {
    app.route('/data/collection')
        .post(function (req, res) {
            req.userObj.add(req.body, function(err) {
                respond(err, res);
            });
        })
        .get(function(req, res) {
            req.userObj.filter(req.body, function(err, result) {
                respond(err, res, result);
            });
        });

    app.route('/data/collection/pop')
        .get(function(req, res) {
            req.userObj.pop(req.body, function(err, result) {
                respond(err, res, result);
            });
        });
}

function SetupRegisterRoutes(app, config) {
    // Route for Registering new users (if config allows it)
    app.post('/user/register', function (req, res) {
        console.log("Register allowed: " + config.allow_registering);
        if(config.allow_registering) {   
            var username = req.body.username
            var password = req.body.password

            app.locals.users.register(username, password, function(error, msg) {
                if(error) res.status(400);
                res.send({"error" : error, "message": msg, username: username})
            });
        } else {
            res.status(400).send("400 - Registering not allowed");
        }
    });

    // ui for registering new users (if config allows it)
    if(config.show_register_ui) {
        app.get('/user/register', function(req, res) {
            res.sendFile(
                path.join(__dirname + '/ui/register/register.html')
            );
        });
    }
}

module.exports = {SetupRoutes: function(app, config) {
    // Debug only Routes
    if(config.test_routes) {
        SetupTestRoutes(app);
    }

    SetupObjectAccessRoutes(app);
    SetupCollectionAccessRoutes(app);
    SetupRegisterRoutes(app, config);
}}