const crypto = require('crypto');
const TOKEN_LENGTH = 32

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

    get(key, callback) {
        var projection = {}
        projection[key] = 1;

       this.db.collection('users').find({'username': this.username}).project(projection).toArray(function(err, result) {
           callback(Boolean(err), err == null? result[0][key] : null);
       });
    }

    update(key, value, callback) {       
        var update = {}
        update[key] = value

        this.db.collection('users').updateOne({'username': this.username}, {$set: update}, function(err, doc) {
            callback(Boolean(err));
        });
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
            //console.log(otherthing);
            callback(Boolean(err));
        });
    }
};