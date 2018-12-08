const crypto = require('crypto');
const TOKEN_LENGTH = 32

const SetRequestFactory = require('./set_requests');
var setRequestFactory = new SetRequestFactory()

const GetRequestFactory = require('./get_requests');
var getRequestFactory = new GetRequestFactory()

const CollectionAddRequest = require('./collections').CollectionAddRequest;
const CollectionFetchRequest = require('./collections').CollectionFetchRequest;

function generateToken(callback) {
    crypto.randomBytes(TOKEN_LENGTH, function(err, buffer) {
        const token = buffer.toString('hex');
        callback(token);
    })
}


class User {
    constructor(db, username) {
        this.db = db;
        this.username = username
    }

    get(requestJson, callback) {
        var request = getRequestFactory.getRequest(this.db, requestJson);
        if(request.isValid() == false) callback(false, {})
        else {
            request.execute(this.username, callback);
        }
    }

    put(requestJson, callback) {        
        var request = setRequestFactory.getRequest(this.db, requestJson);
        if(request.isValid() == false) callback(false);
        else {
            request.execute(this.username, callback);
        }
    }
     
    add(requestJson, callback) {
        var request = new CollectionAddRequest(this.db, requestJson);
        if(request.isValid() == false) {
            callback(false);
            return;
        }

        request.execute(this.username, callback);
    }

    filter(requestJson, callback) {
        var request = new CollectionFetchRequest(this.db, requestJson);
        if(request.isValid() == false) {
            callback(false);
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
        this.db.collection("users").insertOne({"username":username, "password":password}, function(err, otherthing) {
            console.log(err);
            console.log(otherthing);
            callback(Boolean(err));
        });
    }
};