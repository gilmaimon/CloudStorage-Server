module.exports = {
    getNumberOrDefault: function(jsonObj, key, defaultValue) {
        if(jsonObj.hasOwnProperty(key) && !isNaN(jsonObj[key])) {
            return jsonObj[key];
        } else {
            return defaultValue;
        }
    }
}