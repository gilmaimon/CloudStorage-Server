const express = require('express');
var path = require('path');

const Users = require('./database-helpers/users');
const config = require('./config');
var app = express()

/** Middlwares **/

// access logger
app.use(require('./middleware/logger'));

// body parsers
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// requests limit and rate limit
app.use(require('./middleware/ratelimit').get(config));
app.use(require('./middleware/slowdown').get(config));

// console.log request logger
const RequestLogger = require('./middleware/request_logger')
if(config.verbose) app.use(RequestLogger());

// credentials validation
const JsonKeyValidator = require('./middleware/json-validator');
app.use('/data', JsonKeyValidator(['username', 'password']));

const UserLoginValidator = require('./middleware/login-validator')
app.use('/data', UserLoginValidator(app.locals.users))

/** Routes **/

// Debug only Routes
if(config.test_routes) {
    app.get('/', function(req, res) {
        res.end(JSON.stringify(req.body));
    });
    app.post('/', function(req, res) {
        res.end(JSON.stringify(req.body));
    });
}

// Common response utility
function respond(err, res, result = {}) {
    if(err) {
        res.status(400);
    } else {
        res.status(200);
    }

    res.send({"error": err, "result": result});
}

// Single Object Operations

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

// Collections Operations
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

// Route for Registering new users (if config allows it)
app.post('/user/register', function (req, res) {
    if(config.allow_registering) {   
        var username = req.body.username
        var password = req.body.password

        app.locals.users.register(username, password, function(error, msg) {
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