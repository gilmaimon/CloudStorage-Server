class CollectionAddRequest {
    constructor(db, requestJson) {
        this.db = db;
        this.__isValid = this.__parse(requestJson);
    }

    // Returns boolean value indicating if the request 
    // is valid or not (result means isValid)
    __parse(requestJson) {
        if (requestJson.hasOwnProperty('collection_key') && requestJson.hasOwnProperty('value')) {
            this.request = {}
            this.request.collection_key = requestJson['collection_key']
            this.request.value = requestJson['value']
            return true;
        } else return false;
    }

    isValid() {
        return this.__isValid;
    }

    execute(username, callback) {
        if(!this.__isValid) throw Error("Requst is invalid (not parsed properly)");
        var update = {}
        update['data.' + this.request.collection_key] = this.request.value

        this.db.collection('users').updateOne({'username': username}, {$push: update}, function(err, doc) {
            callback(Boolean(err));
        });
    }
}

class CollectionFetchRequest {
    constructor(db, requestJson) {
        this.db = db;
        this.__isValid = this.__parse(requestJson);
    }

    // Returns boolean value indicating if the request 
    // is valid or not (result means isValid)
    __parse(requestJson) {
        if (requestJson.hasOwnProperty('collection_key')) {
            if(requestJson.hasOwnProperty('size') && isNaN(requestJson['size'])) {
                return false;
            }
            this.request = {}
            this.request.collection_key = requestJson['collection_key'];
            return true;
        } else return false;
    }

    isValid() {
        return this.__isValid;
    }

    execute(username, callback) {
        if(!this.__isValid) throw Error("Requst is invalid (not parsed properly)");
        var projection = {}
        projection['data.' + this.request.collection_key] = 1;

        this.db.collection('users').find({"username": username, }).project(projection).toArray(function(err, result) {
            callback(Boolean(err), result[0]['data']);
        });
    }
}

module.exports = {
    CollectionAddRequest: CollectionAddRequest,
    CollectionFetchRequest: CollectionFetchRequest
}