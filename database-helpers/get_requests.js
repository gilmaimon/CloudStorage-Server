const BaseRequest = require('./base_request')

class SingleGetRequest extends BaseRequest {
    constructor(db, requestJson) {
        super(db, requestJson);
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
    __executor(username, callback) {
        var projection = {}
        projection['data.' + this.request.key] = 1;

       this.db.collection('users').find({'username': username}).project(projection).toArray(function(err, result) {
            callback(Boolean(err), result[0]['data']);
       });
    }
}

class MultipleGetRequest extends BaseRequest {
    constructor(db, requestJson) {
        super(db, requestJson);
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

    __executor(username, callback) {
        var projection = {}
        for(var iKey = 0; iKey < this.subKeys.length; iKey++) {
            projection['data.' + this.subKeys[iKey]] = 1;
        }

       this.db.collection('users').find({'username': username}).project(projection).toArray(function(err, result) {
            callback(Boolean(err), result[0]['data']);
       });
    }
}

module.exports = class GetRequestFactory {
    getRequest(db, requestJson) {
        if(requestJson.hasOwnProperty('keys')) {
            return new MultipleGetRequest(db, requestJson);
        } else {
            return new SingleGetRequest(db, requestJson);
        }
    }
}