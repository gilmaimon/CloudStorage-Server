module.exports = function respond(err, res, result = {}) {
    if(err) {
        res.status(400);
    } else {
        res.status(200);
    }

    res.send({"error": err, "result": result});
}