let respond = require('../respond');

module.exports = {
    use: function(app) {
        app.route('/data/collection')
        .post(function (req, res) {
            req.userObj.add(req.body, function(err) {
                respond(err, res);
            });
        })
        .get(function(req, res) {
            req.userObj.filter(req.body, function(err, result) {
                respond(err, res, result);
            });
        });

        app.route('/data/collection/pop')
            .get(function(req, res) {
                req.userObj.pop(req.body, function(err, result) {
                    respond(err, res, result);
                });
            });

        app.route('/data/collection/aggregate')
            .get(function(req, res) {
                req.userObj.aggregate(req.body, function(err, result) {
                    respond(err, res, result);
                })
            });
    }
}