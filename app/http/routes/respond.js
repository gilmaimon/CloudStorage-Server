function _respond(err, res, result = {}) {
    if(err) {
        res.status(400);
    } else {
        res.status(200);
    }

    res.send({"error": err, "result": result});
}

module.exports = function(res) {
    return function(err, result) {
        _respond(err, res, result);
    }
}