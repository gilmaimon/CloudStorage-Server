module.exports = function validator(keys) {
    return function(req, res, next) {
        missingKeys = []
        keys.forEach(function(key) {
            if (req.body[key] == null) {
                missingKeys += key
            }
        })

        if(missingKeys.length > 0) {
            res.status(400);
            res.send('400: Bad Request. Missing keys: [' + keys.join(', ') + ']');
        } else {
            next()
        }
    }
}