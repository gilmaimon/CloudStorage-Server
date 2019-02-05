function initUsersDatabase(db) {
    return new Promise(function(resolve, reject) {
        // init users collection and indexes
        db.createCollection('users', {
            validator: { $and: [{
                "username": { $type: "string", $exists: true },
                "password": { $type: "string", $exists: true }
            }]}
        }, function(err) {
            if(err) reject(err);
            else resolve(null);
        });
        db.collection('users').createIndex( 
            {'username': 1}, { unique: true } 
        );
    });
}

let mongodb = require('mongodb');

module.exports = {
    initDatabaseConnection: async function(fullUrl, callback) {
        try {
            let client = await mongodb.MongoClient.connect(
                fullUrl, 
                { useNewUrlParser:true }
            );
            let db = client.db("cloudstorage");
            await initUsersDatabase(db);
            callback(false, db);
        } catch(err) {
            callback(true, null);
        }
    }
}