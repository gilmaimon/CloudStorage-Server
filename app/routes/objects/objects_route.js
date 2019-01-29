let respond = require('../respond');

module.exports = {
    use: function(app) {
        app.route('/data/object')
        .get(function (req, res) {
            req.userObj.get(req.body, function(err, result) {
                respond(err, res, result);
            });
        })
        .post(function (req, res) {
            req.userObj.put(req.body, function(err) {
                respond(err, res);
            });
        });
    
        app.route('/data/object/atomic')
            .get(function(req, res) {
                req.userObj.atomic(req.body, function(err, result) {
                    respond(err, res, result);
                })
            })
            .post(function(req, res) {
                req.userObj.atomic(req.body, function(err) {
                    respond(err, res);
                })
            });
    }
}