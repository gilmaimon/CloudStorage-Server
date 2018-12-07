class SingleGetRequest {
    constructor(db, requestJson) {
        this.db = db;
        this.__isValid = this.__parse(requestJson);
    }

    // Returns boolean value indicating if the request 
    // is valid or not (result means isValid)
    __parse(requestJson) {
        if (requestJson.hasOwnProperty('key')) {
            this.request = {}
            this.request.key = requestJson['key']
            return true;
        } else return false;
    }

    isValid() {
        return this.__isValid;
    }

    execute(username, callback) {
        if(!this.__isValid) throw Error("Requst is invalid (not parsed properly)");

        var projection = {}
        projection['data.' + this.request.key] = 1;

       this.db.collection('users').find({'username': username}).project(projection).toArray(function(err, result) {
            var parsedResult = {}
            parsedResult['error'] = Boolean(err);
            parsedResult['result'] = result[0]['data'];
            callback(Boolean(err), parsedResult);
       });
    }
}

class MultipleGetRequest {
    constructor(db, requestJson) {
        this.db = db;
        this.subKeys = []
        this.__isValid = this.__parse(requestJson);
    }

    // Returns boolean value indicating if the request 
    // is valid or not (result means isValid)
    __parse(requestJson) {
        if(requestJson.hasOwnProperty('keys')) {
            this.subKeys = requestJson['keys'];
            return true;
        } 
        else return false;
    }

    isValid() {
        return this.__isValid;
    }

    execute(username, callback) {
        if(!this.__isValid) throw Error("Requst is invalid (not parsed properly)");

        var projection = {}
        for(var iKey = 0; iKey < this.subKeys.length; iKey++) {
            projection['data.' + this.subKeys[iKey]] = 1;
        }

       this.db.collection('users').find({'username': username}).project(projection).toArray(function(err, result) {
            var parsedResult = {}
            parsedResult['error'] = Boolean(err);
            parsedResult['result'] = result[0]['data'];
            callback(Boolean(err), parsedResult);
       });
    }
}

module.exports = class GetRequestFactory {
    constructor() {}

    getRequest(db, requestJson) {
        if(requestJson.hasOwnProperty('keys')) {
            return new MultipleGetRequest(db, requestJson);
        } else {
            return new SingleGetRequest(db, requestJson);
        }
    }
}