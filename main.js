const express = require('express');
const bodyParser = require('body-parser');
const Users = require('./user');
const JsonKeyValidator = require('./json_validator');
const UserLoginValidator = require('./user_login_validator')

var app = express()

/* Middleware */
app.use(bodyParser.json());
app.use('/data', JsonKeyValidator(['username', 'password']));
app.use('/data', UserLoginValidator(app.locals.users))

//validate mandatory parameters
app.use('/data', function(req, res, next) {
    var action = req.body.action;
    if(action == null) {
        res.status(400);
        res.send('400: Bad Request. Missing mandatory action parameter');
    } else if(action == 'GetObject') {
        if(req.body.key != null) {
            next();
        } else {
            res.status(400);
            res.send('400: Bad Request. Missing mandatory parameters for action: ' + action);
        }
    } else if(action == 'SetObject') {
        if(req.body.key != null && req.body.key != null) {
            next();
        } else {
            res.status(400);
            res.send('400: Bad Request. Missing mandatory parameters for action: ' + action);
        }
    }
})

/* Data Routes */
app.get('/data', function (req, res) {
    if(req.body.action == 'GetObject') {
        const key = req.body.key;

        req.userObj.get(key, function(err, result) {
            if(err) {
                res.status(400);
                res.send("Error");
            } else {
                res.send({result});
            }
        })
    }
})

app.post('/data', function (req, res) {
    if(req.body.action == 'SetObject') {
        const key = req.body.key;
        const value = req.body.value;
        
        req.userObj.update(key, value, function(err) {
            res.send({"error": err});
        })
    } else {
        res.send({"error": true});
    }
})

// Route for Registering new users
app.post('/user/register', function (req, res) {
    var username = req.body.username
    var password = req.body.password
    app.locals.users.register(username, password, function(error) {
        console.log("Register error? " + error);
        res.send({"error" : error})
    })
})

require('./database').initDatabaseConnection("mongodb://localhost:27017", function(db) {
    app.locals.users = new Users(db);
    app.listen(8080, '0.0.0.0');
})