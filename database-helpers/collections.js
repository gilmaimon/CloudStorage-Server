const BaseRequest = require('./base_request')

class CollectionAddRequest extends BaseRequest {
    constructor(db, requestJson) {
        super(db, requestJson);
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

    __executor(username, callback) {
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

class CollectionFetchRequest extends BaseRequest {
    constructor(db, requestJson) {
        super(db, requestJson);
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
            return true;
        } else return false;
    }

    __executor(username, callback) {
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

        this.db.collection('users').aggregate([
            { $match : { "username" : username }},
            projectBlock,
            { $project : { _id: false } }
        ]).toArray(function(err, result) {
            callback(Boolean(err), result[0]);
        });
    }
}

class CollectionPopRequest extends BaseRequest {
    constructor(db, requestJson) {
        super(db, requestJson);
    }

    // Returns boolean value indicating if the request 
    // is valid or not (result means isValid)
    __parse(requestJson) {
        if (requestJson.hasOwnProperty('collection_key') && requestJson.hasOwnProperty('position') &&
            ["first", "last"].includes(requestJson.position) ) {
            this.request = {}
            this.request.position = requestJson['position'];
            this.request.collection_key = requestJson['collection_key'];
            return true;
        } else return false;
    }

    __popItem(username, collection_key, popFirstElement, value, willBeEmpty, callback) {
        this.db.collection('users').updateOne({username: username}, {$pop: { ["data." + collection_key] : popFirstElement? -1: 1}}, function(err) {
            callback(Boolean(err), {value: value, empty: willBeEmpty});
        });
    }

    __getTop(username, collection_key, popFirstElement, callback) {
        this.db.collection('users').aggregate([
            { $match: { username: username } },
            { $project: {
                topElements: { $slice: [ "$data." + collection_key, popFirstElement? 0 : -2, 2] },
            }},
        ]).toArray(function(err, res) {
            if(err) {
                callback(true, null, null);
                return;
            }
            // the result will be either: [firstItem, nextItem], [firstItem], [beforeLastItem, lastItem], [lastItem] or [] in case of empty array
            // the cases represent diffrent states of the array before popping the value and the code below gets the required value (either 
            // first item or last item depending on $popFirstElement). also checks if there are more items in the array (returned size is >= 1)
            var value = null;
            var empty = false;
            if(res[0].topElements && res[0].topElements.length > 1) {
                if(popFirstElement) value = res[0].topElements[0];
                else value = res[0].topElements[1];
            } else {
                if(res[0].topElements.length == 1) {
                    value = res[0].topElements[0];
                    empty = true;
                } else {
                    // There is no such item (probably array is already empty), we consider that case as an error
                    callback(true, null, null);
                    return;
                }
            }

            callback(false, value, empty);
        })
    }

    __executor(username, callback) {
        var popFirstElement = this.request.position == "first";
        var collection_key = this.request.collection_key
        var that = this;

        this.__getTop(username, collection_key, popFirstElement, function(err, value, willBeEmpty) {
            if(err) {
                callback(true, null);
                return;
            }

            that.__popItem(username, collection_key, popFirstElement, value, willBeEmpty, callback);
        });
    }
}

module.exports = {
    CollectionAddRequest: CollectionAddRequest,
    CollectionFetchRequest: CollectionFetchRequest,
    CollectionPopRequest: CollectionPopRequest
}