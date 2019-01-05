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

const getNumberOrDefault = require('../utils').getNumberOrDefault

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

    __getTopFromPairResponse(item, popFirstElement, callback) {
        // the result will be either: [firstItem, nextItem], [firstItem], [beforeLastItem, lastItem], [lastItem] or [] in case of empty array
        // the cases represent diffrent states of the array before popping the value and the code below gets the required value (either 
        // first item or last item depending on $popFirstElement). also checks if there are more items in the array (returned size is >= 1)        
        if(item.topElements == null) {
            callback(true, null, null);
            return;
        }
        
        if(item.topElements.length > 1) {
            if(popFirstElement) {
                callback(false, item.topElements[0], false);
            }
            else {
                callback(false, item.topElements[1], false);
            }
        } else {
            if(item.topElements.length == 1) {
                callback(false, item.topElements[0], true);
            } else {
                // There is no such item (probably array is already empty), we consider that case as an error
                callback(true, null, null);
            }
        }
    }

    __getTop(username, collection_key, popFirstElement, callback) {
        var that = this;
        this.db.collection('users').aggregate([
            { $match: { username: username } },
            { $project: {
                topElements: { $slice: [ "$data." + collection_key, popFirstElement? 0 : -2, 2] },
            }},
        ]).toArray(function(err, res) {
            if(err || res.length == 0) {
                callback(true, null, null);
                return;
            }
            
            const item = res[0];
            that.__getTopFromPairResponse(item, popFirstElement, callback);
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

class AggregateRequest extends BaseRequest {
    constructor(db, requestJson) {
        super(db, requestJson);
    }

    // Returns boolean value indicating if the request 
    // is valid or not (result means isValid)
    __parse(requestJson) {
        if (requestJson.hasOwnProperty('collection_key') && requestJson.hasOwnProperty('action')) {
            this.request = {}
            this.request.collection_key = requestJson['collection_key'];
            this.request.subkey = requestJson['subkey'];
            this.request.action = requestJson['action'];
            return true;
        } else return false;
    }

    __getMinMaxElement(username, callback, isMin) {
        this.db.collection('users').aggregate([
            { $match: { username: username } },
            { $project: {['data.' + this.request.collection_key]: 1} },
            { $unwind: { path: '$data.' + this.request.collection_key} },
            { $sort : {['data.' + this.request.subkey]: isMin? 1: -1} },
            { $group : {
                _id: null,
                result: { $first: "$data." + this.request.collection_key }
            }}
        ]).toArray(function(err, res) {
            if(err || res.length == 0) {
                callback(true, null, null);
                return;
            }

            callback(false, res[0]['result']);
        });
    }

    __requireSubkey() {
        if(this.request.subkey == null) {
            this.request.subkey = this.request.collection_key
        } else {
            this.request.subkey = this.request.collection_key + '.' + this.request.subkey;
        }
    }

    __executor(username, callback) {
        var collection_key = this.request.collection_key
        switch(this.request.action) {
            case 'max':
                this.__requireSubkey();
                this.__getMinMaxElement(username, callback, false);
                break;
            
            case 'min':
                this.__requireSubkey();
                this.__getMinMaxElement(username, callback, true);
                break;

            default:
                callback("Unkown action", null);
        }
    }
}
module.exports = {
    CollectionAddRequest: CollectionAddRequest,
    CollectionFetchRequest: CollectionFetchRequest,
    CollectionPopRequest: CollectionPopRequest,
    AggregateRequest: AggregateRequest
}