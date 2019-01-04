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
            this.request = {}
            this.request.key = requestJson['key']
            this.request.action = requestJson['action']
            this.request.value = requestJson.value;
            return true;
        } else return false;
    }
    __executor(username, callback) {
        var projection = {}
        projection['data.' + this.request.key] = 1;

        switch(this.request.action) {
            case 'inc':
                var value = getNumberOrDefault(this.request, 'value', 1);
                this.db.collection('users').findAndModify(
                    { username: username },
                    [],
                    { $inc: { ['data.' + this.request.key]: value } },
                    { upsert: true, new: true, fields: {['data.' + this.request.key]: 1} },
                function(err, result) {
                    callback(Boolean(err), result['value']['data']);
                });
                break;
            default: 
                callback("Unkown action", null);
                break;
        }
    }
}}