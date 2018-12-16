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

function getNumberOrDefault(jsonObj, key, defaultValue) {
    if(jsonObj.hasOwnProperty(key) && !isNaN(jsonObj[key])) {
        return jsonObj[key];
    } else {
        return defaultValue;
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
            this.request = {}
            this.request.limit = getNumberOrDefault(requestJson, 'limit', 20);
            this.request.skip = getNumberOrDefault(requestJson, 'skip', 0);
            this.request.from_last = requestJson.from_last? Boolean(requestJson.from_last) : false;
            this.request.collection_key = requestJson['collection_key'];
            console.log(this.request);
            return true;
        } else return false;
    }

    isValid() {
        return this.__isValid;
    }

    execute(username, callback) {
        if(!this.__isValid) throw Error("Requst is invalid (not parsed properly)");

        var projectBlock = null;
        if(this.request.from_last) {
            projectBlock = { $project: { 
                [this.request.collection_key] : { $slice: [
                    "$data." + this.request.collection_key,
                    this.request.limit * -1
                ]}
            }}
        } else {
            projectBlock = { $project: { 
                [this.request.collection_key] : { $slice: [
                    "$data." + this.request.collection_key,
                    this.request.skip, 
                    this.request.limit
                ]}
            }}
        }

        console.log(username);
        this.db.collection('users').aggregate([
            { $match : { "username" : username }},
            projectBlock,
            { $project : { _id: false } }
        ]).toArray(function(err, result) {
            callback(Boolean(err), result[0]);
        });
    }
}

module.exports = {
    CollectionAddRequest: CollectionAddRequest,
    CollectionFetchRequest: CollectionFetchRequest
}