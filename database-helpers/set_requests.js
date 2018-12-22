const BaseRequest = require('./base_request')

class SingleSetRequest extends BaseRequest {
    constructor(db, requestJson) {
        super(db, requestJson);
    }

    __parse(requestJson) {
        if (requestJson.hasOwnProperty('key') && requestJson.hasOwnProperty('value')) {
            this.request = {}
            this.request.key = requestJson['key']
            this.request.value = requestJson['value']
            return true;
        } else return false;
    }

    __executor(username, callback) {
        var update = {}
        update['data.' + this.request.key] = this.request.value

        this.db.collection('users').updateOne({'username': username}, {$set: update}, function(err, doc) {
            callback(Boolean(err));
        });
    }
}


class MultipleSetRequest extends BaseRequest {
    constructor(db, requestJson) {
        super(db, requestJson);
    }

    __parse(requestJson) {
        if(requestJson.hasOwnProperty('operations')) {
            this.subRequests = []
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

    __executor(username, callback) {
        var errorResults = []
        const subRequestsLen = this.subRequests.length;
        var iRequest = 0;
        for(iRequest = 0; iRequest < subRequestsLen; iRequest++) {
            this.subRequests[iRequest].execute(username, function(err) {
                errorResults.push(err)
                if(subRequestsLen == errorResults.length) {
                    callback(errorResults);
                }
            });
        }
    }
}

module.exports = class SetRequestFactory {
    getRequest(db, requestJson) {
        if(requestJson.hasOwnProperty('operations')) {
            return new MultipleSetRequest(db, requestJson);
        } else {
            return new SingleSetRequest(db, requestJson);
        }
    }
}