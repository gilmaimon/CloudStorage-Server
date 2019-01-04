const BaseRequest = require('./base_request')

function getNumberOrDefault(jsonObj, key, defaultValue) {
    if(jsonObj.hasOwnProperty(key) && !isNaN(jsonObj[key])) {
        return jsonObj[key];
    } else {
        return defaultValue;
    }
}

module.exports = {AtmoicOperationRequest: class AtmoicOperationRequest extends BaseRequest {
    constructor(db, requestJson) {
        super(db, requestJson);
    }

    // Returns boolean value indicating if the request 
    // is valid or not (result means isValid)
    __parse(requestJson) {
        if (requestJson.hasOwnProperty('key') && requestJson.hasOwnProperty('action')) {

            if((requestJson.action == 'max' || requestJson.action == 'min') && requestJson.value == null) return false;
            
            this.request = {}
            this.request.key = requestJson['key']
            this.request.action = requestJson['action']
            this.request.value = requestJson.value;
            return true;
        } else return false;
    }

    __increment(username, callback, value) {
        this.db.collection('users').findAndModify(
            { username: username },
            [],
            { $inc: { ['data.' + this.request.key]: value } },
            { upsert: true, new: true, fields: {['data.' + this.request.key]: 1} },
        function(err, result) {
            callback(Boolean(err)? "Operation failed. Might be overflow": false, Boolean(err)? null: result['value']['data']);
        });
    }

    __multiply(username, callback, value) {
        this.db.collection('users').findAndModify(
            { username: username },
            [],
            { $mul: { ['data.' + this.request.key]: value } },
            { upsert: true, new: true, fields: {['data.' + this.request.key]: 1} },
        function(err, result) {
            callback(Boolean(err)? "Operation failed. Might be overflow": false, Boolean(err)? null: result['value']['data']);
        });
    }

    
    __currdate(username, callback) {
        this.db.collection('users').findAndModify(
            { username: username },
            [],
            { $currentDate: { ['data.' + this.request.key]: { $type: "timestamp" } } },
            { upsert: true, new: true, fields: {['data.' + this.request.key]: 1} },
        function(err, result) {
            callback(Boolean(err)? "Operation failed. Might be overflow": false, Boolean(err)? null: result['value']['data']);
        });
    }

    __max(username, callback, value) {
        this.db.collection('users').findAndModify(
            { username: username },
            [],
            { $max: { ['data.' + this.request.key]: value } },
            { upsert: true, new: true, fields: {['data.' + this.request.key]: 1} },
        function(err, result) {
            callback(Boolean(err)? "Operation failed. Might be overflow": false, Boolean(err)? null: result['value']['data']);
        });
    }

    __min(username, callback, value) {
        this.db.collection('users').findAndModify(
            { username: username },
            [],
            { $min: { ['data.' + this.request.key]: value } },
            { upsert: true, new: true, fields: {['data.' + this.request.key]: 1} },
        function(err, result) {
            callback(Boolean(err)? "Operation failed. Might be overflow": false, Boolean(err)? null: result['value']['data']);
        });
    }

    __executor(username, callback) {
        var projection = {}
        projection['data.' + this.request.key] = 1;

        switch(this.request.action) {
            case 'inc':
                var value = getNumberOrDefault(this.request, 'value', 1);
                this.__increment(username, callback, value);
                break;
            
            case 'dec':
                var value = getNumberOrDefault(this.request, 'value', 1);
                this.__increment(username, callback, -value);
                break;

            case 'mul': 
                var value = getNumberOrDefault(this.request, 'value', 2);
                this.__multiply(username, callback, value);
                break;

            case 'date':
                this.__currdate(username, callback);
                break;

            case 'min':
                this.__min(username, callback, this.request.value);
                break;

            case 'max':
                this.__max(username, callback, this.request.value);
                break;

            default: 
                callback("Unkown action", null);
                break;
        }
    }
}}