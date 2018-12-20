const SetRequestFactory = require('./set_requests');
var setRequestFactory = new SetRequestFactory()

const GetRequestFactory = require('./get_requests');
var getRequestFactory = new GetRequestFactory()

const CollectionAddRequest = require('./collections').CollectionAddRequest;
const CollectionFetchRequest = require('./collections').CollectionFetchRequest;
const CollectionPopRequest = require('./collections').CollectionPopRequest;

class User {
    constructor(db, username) {
        this.db = db;
        this.username = username
    }

    get(requestJson, callback) {
        var request = getRequestFactory.getRequest(this.db, requestJson);
        if(request.isValid() == false) callback(true, {})
        else {
            request.execute(this.username, callback);
        }
    }

    put(requestJson, callback) {        
        var request = setRequestFactory.getRequest(this.db, requestJson);
        if(request.isValid() == false) callback(true);
        else {
            request.execute(this.username, callback);
        }
    }
     
    add(requestJson, callback) {
        var request = new CollectionAddRequest(this.db, requestJson);
        if(request.isValid() == false) {
            callback(true);
            return;
        }

        request.execute(this.username, callback);
    }

    filter(requestJson, callback) {
        var request = new CollectionFetchRequest(this.db, requestJson);
        if(request.isValid() == false) {
            callback(true);
            return;
        }

        request.execute(this.username, callback);
    }

    pop(requestJson, callback) {
        var request = new CollectionPopRequest(this.db, requestJson);
        if(request.isValid() == false) {
            callback(false, null);
            return;
        }

        request.execute(this.username, callback);
    }
}


module.exports = class Users {
    constructor (db) {
        this.db = db;
    }

    login(username, password, callback) {
        var _db = this.db
        this.db.collection("users").find({"username":username, "password":password}).toArray(function(err, result){
            if(result.length > 0) {
                callback(true, new User(_db, username))
            }
            else {
                callback(false, null);
            }
        })
    }
    
    register(username, password, callback) {
        if(username == null || password == null) {
            callback(true, "missing parameters (username/password)");
            return;
        }

        username = username.trim();
        password = password.trim();

        var errorMsg = function(username, password) {
            if(username.length < 4 || username.length > 16) return "Error: username longer than 16 or shorter than 4 characters";
            if(password.length < 8 || password.length > 36) return "Error: password longer than 36 or shorter than 8 characters";
            return null;
        } (username, password);

        if(errorMsg != null) {
            callback(true, errorMsg);
            return;
        }

        this.db.collection("users").insertOne({"username":username, "password":password}, function(err, otherthing) {
            callback(Boolean(err), Boolean(err)? "Error: Username might be taken.": "OK");
        });
    }
};