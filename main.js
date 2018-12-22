const express = require('express');
const bodyParser = require('body-parser');
var fs = require('fs');
var morgan = require('morgan');
var path = require('path');

// DB Helpers
const Users = require('./database-helpers/users');

// Middleware
const JsonKeyValidator = require('./middleware/json-validator');
const UserLoginValidator = require('./middleware/login-validator')
const RequestLogger = require('./middleware/request_logger')

// Config
const config = require('./config');
config.port = config.port || 8080;
config.verbose = config.verbose || false;
config.allow_registering = config.allow_registering || false;
config.test_routes = config.test_routes || false; 
config.show_register_ui = config.show_register_ui || false;

config.requests_limiter_window_minutes = config.requests_limiter_window_minutes || 15 * 60 * 1000;
config.requests_limiter_max_requests = config.requests_limiter_max_requests || 500;

config.slowdown_window_minutes = config.slowdown_window_minutes || 15 * 60 * 1000;
config.slowdown_max_requests = config.slowdown_max_requests || 500;
config.slowdown_delay_ms = config.slowdown_delay_ms || 500;

var app = express()

// returns as key (for limiting and slowing down requests) returns the username or the ip (if no username is provided)
usernameOrIpKeyGenerator = function(req) {
    if (req.body['username'] != null) return req.body.username;
    else return req.ip;
};

// Logger
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
app.use(morgan('combined', { stream: accessLogStream }))

// Setup Middlwares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// requests throttler and limiter
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
    windowMs: config.requests_limiter_window_minutes * 60 * 1000,
    max: config.requests_limiter_max_requests,
    handler: function(req, res) {
        res.status(429).send({error: true, message: "Too Many Requests. Wait and try again."});
    },
    keyGenerator: usernameOrIpKeyGenerator
});

// requests slowdown
const slowDown = require('express-slow-down');
const speedLimiter = slowDown({
    windowMs: config.slowdown_window_minutes * 60 * 1000, 
    delayAfter: config.slowdown_max_requests,
    delayMs: config.slowdown_delay_ms,
    keyGenerator: usernameOrIpKeyGenerator
});

app.use(limiter);
app.use(speedLimiter);
if(config.verbose) app.use(RequestLogger());
app.use('/data', JsonKeyValidator(['username', 'password']));
app.use('/data', UserLoginValidator(app.locals.users))

// Debug Routes
if(config.test_routes) {
    app.get('/', function(req, res) {
        res.end(JSON.stringify(req.body));
    });
    app.post('/', function(req, res) {
        res.end(JSON.stringify(req.body));
    });
}

// Common response utility
function respondResult(err, result, res) {
    if(err) {
        res.status(400).send({"error": true});
    } else {
        res.status(200);
        var parsedResult = {};
        parsedResult.error = false;
        parsedResult['result'] = result;
        res.send(parsedResult);
    }
}

function respondEmpty(err, res) {
    if(err) {
        res.status(400).send({"error": true});
    } else {
        res.status(200).send({"error": false});
    }
}

// Single Object Operations
app.get('/data/object', function (req, res) {
    req.userObj.get(req.body, function(err, result) {
        respondResult(err, result, res);
    });
});
app.post('/data/object', function (req, res) {
    req.userObj.put(req.body, function(err) {
        respondEmpty(err, res);
    });
});

// Collections Operations
app.post('/data/collection', function (req, res) {
   req.userObj.add(req.body, function(err) {
       respondEmpty(err, res);
   });
});

app.get('/data/collection', function(req, res) {
    req.userObj.filter(req.body, function(err, result) {
        respondResult(err, result, res);
    });
});

app.get('/data/collection/pop', function(req, res) {
    req.userObj.pop(req.body, function(err, result) {
        respondResult(err, result, res);
    });
});

// Route for Registering new users
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

if(config.show_register_ui) {
    app.get('/user/register', function(req, res) {
        res.sendFile(
            require('path').join(__dirname + '/ui/register/register.html')
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