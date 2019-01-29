module.exports = {
    attach: function(app) {
        const bodyParser = require('body-parser');
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
    }
}