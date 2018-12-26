const SetRequestFactory = require('./set_requests');
var setRequestFactory = new SetRequestFactory()

const GetRequestFactory = require('./get_requests');
var getRequestFactory = new GetRequestFactory()

const CollectionAddRequest = require('./collections').CollectionAddRequest;
const CollectionFetchRequest = require('./collections').CollectionFetchRequest;
const CollectionPopRequest = require('./collections').CollectionPopRequest;

const bcrypt = require('bcrypt');



class User {
    constructor(db, username) {
        this.db = db;
        this.username = username
    }

    __tryRequest(request, callback) {
        if(request.isValid() == false) {
            callback(true);
        }
        else {
            request.execute(this.username, callback);
        }
    }

    get(requestJson, callback) {
        var request = getRequestFactory.getRequest(this.db, requestJson);
        this.__tryRequest(request, callback);
    }

    put(requestJson, callback) {        
        var request = setRequestFactory.getRequest(this.db, requestJson);
        this.__tryRequest(request, callback);
    }
     
    add(requestJson, callback) {
        var request = new CollectionAddRequest(this.db, requestJson);
        this.__tryRequest(request, callback);
    }

    filter(requestJson, callback) {
        var request = new CollectionFetchRequest(this.db, requestJson);
        this.__tryRequest(request, callback);
    }

    pop(requestJson, callback) {
        var request = new CollectionPopRequest(this.db, requestJson);
        this.__tryRequest(request, callback);
    }
}


module.exports = class Users {
    constructor (db) {
        this.db = db;
    }

    __fetchUserDetais(username, callback) {
        this.db.collection("users").find({"username":username}).project({'username': true, 'password': true}).toArray(function(err, result) {
            if(!err && result.length > 0) callback(result[0]);
            else callback(null);
        })
    }

    login(username, password, callback) {
        var db = this.db;
        
        this.__fetchUserDetais(username, function(userObj) {
            if(userObj == null) {
                callback(false, null);
                return;
            }

            var storedHash = userObj.password;
            bcrypt.compare(password, storedHash, function(err, doesMatch) {
                if(!err && doesMatch) {
                    // hash matched, user logged in
                    callback(true, new User(db, username))
                } else {
                    // hash not matched
                    callback(false, null);
                }
            });
        })
    }

    // returns: error message as a string or null in case of no error
    __validateRegisterParams(username, password) {
        if(username == null || password == null) {
            return "missing parameters (username/password)";
        } else if(typeof(username) != typeof(password) || typeof(username) != 'string') {
            return "parameters (username/password) must be strings."
        }

        username = username.trim();
        password = password.trim();

        if(username.length < 4 || username.length > 16) return "Error: username longer than 16 or shorter than 4 characters";
        if(password.length < 8 || password.length > 36) return "Error: password longer than 36 or shorter than 8 characters";

        return null;
    }

    __registerUser(username, password, callback) {
        var db = this.db;
        bcrypt.hash(password, 5, function(err, hashedPassword) {
            db.collection("users").insertOne({"username":username, "password":hashedPassword}, function(err, otherthing) {
                callback(Boolean(err), Boolean(err)? "Error: Username might be taken.": "OK");
            });
        });
    }
    
    register(username, password, callback) {
        var error = this.__validateRegisterParams(username, password);

        if(error) {
            callback(true, error);
            return;
        }

        this.__registerUser(username, password, callback);
    }
};