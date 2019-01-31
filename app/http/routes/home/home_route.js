var package = require('../../../../package.json');

module.exports = {
    use: function(app) {
        app.get('/', function(req, res) {
            res.send({version: package.version});
        });
        app.post('/', function(req, res) {
            res.send({version: package.version});
        });
    }
}