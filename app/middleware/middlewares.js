module.exports = {AttachMiddlewares: function(app) {    
    // access logger
    app.use(require('./logger'));
    // body parsers
    const bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    // requests limit and rate limit
    app.use(require('./ratelimit').get(app.locals.config));
    app.use(require('./slowdown').get(app.locals.config));
    // console.log request logger
    if(app.locals.config.verbose) {
        const RequestLogger = require('./request_logger')
        app.use(RequestLogger());
    }
        
    // credentials validation
    const JsonKeyValidator = require('./json-validator');
    app.use('/data', JsonKeyValidator(['username', 'password']));
    const UserLoginValidator = require('./login-validator')
    app.use('/data', UserLoginValidator(app.locals.users))
}}