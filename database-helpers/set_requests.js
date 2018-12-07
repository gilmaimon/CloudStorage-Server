class SingleSetRequest {
    constructor(db, requestJson) {
        this.db = db;
        this.__isValid = this.__parse(requestJson);
    }

    // Returns boolean value indicating if the request 
    // is valid or not (result means isValid)
    __parse(requestJson) {
        if (requestJson.hasOwnProperty('key') && requestJson.hasOwnProperty('value')) {
            this.request = {}
            this.request.key = requestJson['key']
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
        update['data.' + this.request.key] = this.request.value

        this.db.collection('users').updateOne({'username': username}, {$set: update}, function(err, doc) {
            callback(Boolean(err));
        });
    }
}

class MultipleSetRequest {
    constructor(db, requestJson) {
        this.db = db;
        this.subRequests = []
        this.__isValid = this.__parse(requestJson);
    }

    // Returns boolean value indicating if the request 
    // is valid or not (result means isValid)
    __parse(requestJson) {
        if(requestJson.hasOwnProperty('operations')) {
            var operations = requestJson.operations;
            for(var iOperation = 0; iOperation < operations.length; iOperation++) {
                var subRequest = new SingleSetRequest(this.db, operations[iOperation]);
                if(!subRequest.isValid()) return false;
                this.subRequests.push(subRequest);
            }
            return true;
        } 
        else return false;
    }

    isValid() {
        return this.__isValid;
    }

    execute(username, callback) {
        if(!this.__isValid) throw Error("Requst is invalid (not parsed properly)");
        var errorResults = []
        const subRequestsLen = this.subRequests.length;
        var iRequest = 0;
        for(iRequest = 0; iRequest < subRequestsLen; iRequest++) {
            this.subRequests[iRequest].execute(username, function(err) {
                errorResults.push(err)
                if(subRequestsLen == errorResults.length) {
                    console.log("calling callback");
                    callback(errorResults);
                }
            });
        }
    }
}

module.exports = class SetRequestFactory {
    constructor() {}

    getRequest(db, requestJson) {
        if(requestJson.hasOwnProperty('operations')) {
            return new MultipleSetRequest(db, requestJson);
        } else {
            return new SingleSetRequest(db, requestJson);
        }
    }
}