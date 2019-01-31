module.exports = {
    attach: function(app) {
        // credentials validation
        const JsonKeyValidator = require('./json-validator');
        app.use('/data', JsonKeyValidator(['username', 'password']));
        const UserLoginValidator = require('./login-validator')
        app.use('/data', UserLoginValidator(app.locals.users))
    }
}