let respond = require('../respond');

module.exports = {
    use: function(app) {
        app.route('/data/object')
            .get(function (req, res) {
                req.userObj.get(req.body, respond(res));
            })
            .post(function (req, res) {
                req.userObj.put(req.body, respond(res));
            });
    
        app.route('/data/object/atomic')
            .get(function(req, res) {
                req.userObj.atomic(req.body, respond(res));
            })
            .post(function(req, res) {
                req.userObj.atomic(req.body, respond(res));
            });
    }
}