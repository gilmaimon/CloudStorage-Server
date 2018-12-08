const express = require('express');
const bodyParser = require('body-parser');
const Users = require('./database-helpers/users');
const JsonKeyValidator = require('./middleware/json-validator');
const UserLoginValidator = require('./middleware/login-validator')

var app = express()

/**** Middleware ****/
app.use(bodyParser.json());
app.use('/data', JsonKeyValidator(['username', 'password']));
app.use('/data', UserLoginValidator(app.locals.users))

/**** Data Routes ****/

/* Single Object Operations*/
app.get('/data/object', function (req, res) {
    req.userObj.get(req.body, function(err, result) {
        res.send(result);
    })
})

app.post('/data/object', function (req, res) {
    req.userObj.put(req.body, function(err) {
        res.send({"error": err});
    })
})

/* Collections Operations*/
app.post('/data/collection', function (req, res) {
   req.userObj.add(req.body, function(err) {
       res.send({"error": err});
   })
})

app.get('/data/collection', function(req, res) {
    req.userObj.filter(req.body, function(err, result) {
        if(err) {
            res.send({"error": true});
        } else {
            var parsedResult = {}
            parsedResult.error = false;
            parsedResult['result'] = result;
            res.send(parsedResult);
        }
    })
})

// Route for Registering new users
app.post('/user/register', function (req, res) {
    var username = req.body.username
    var password = req.body.password
    app.locals.users.register(username, password, function(error) {
        res.send({"error" : error})
    })
})

require('./database-helpers/database').initDatabaseConnection("mongodb://localhost:27017", function(db) {
    app.locals.users = new Users(db);
    app.listen(8080, '0.0.0.0');
})