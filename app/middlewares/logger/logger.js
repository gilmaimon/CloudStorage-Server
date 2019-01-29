var fs = require('fs');
var morgan = require('morgan');
var path = require('path');

var accessLogStream = fs.createWriteStream(path.join(__dirname, '../../../access.log'), { flags: 'a' });
module.exports = {
    attach: function(app) {
        app.use(morgan('combined', { stream: accessLogStream }))
    }
}