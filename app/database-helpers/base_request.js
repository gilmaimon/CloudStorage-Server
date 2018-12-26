module.exports = class BaseRequest {
    constructor(db, requestJson) {
        this.db = db;
        this.__isValid = this.__parse(requestJson);
    }

    isValid() {
        return this.__isValid;
    }

    __parse(requestJson) {
        throw Error("parse() Must be implemented!")
    }

    execute(username, callback) {
        if(!this.__isValid) throw Error("Requst is invalid (not parsed properly)");
        this.__executor(username, callback);
    }

    __executor(username, callback) {
        throw Error("executor() Must be implemented!")
    }
};