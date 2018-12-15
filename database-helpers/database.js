function initDb(db) {
    // init users collection and indexes
    db.createCollection('users', {
        validator: { $and: [ 
            {
                "username": {
                    $type: "string", 
                    $exists: true
                },
                "password": {
                    $type: "string", 
                    $exists: true
                }
    }]}}, function(err, collection) {
        console.log("Database Ready");
    });
    db.collection('users').createIndex( {'username': 1}, { unique: true } );
}

const dbClient = require('mongodb').MongoClient;

module.exports = {
    initDatabaseConnection: function initDatabaseConnection(fullUrl, callback) {
        dbClient.connect(fullUrl, {useNewUrlParser:true}, function(err, db) {
            if (err) callback(true, null);
            else {
                db = db.db("cloudstorage");
                initDb(db);
                callback(false, db);
            }
        })
    }
}