module.exports = {AttachMiddlewares: function(app, config) {    
    // access logger
    app.use(require('./logger'));
    // body parsers
    const bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    // requests limit and rate limit
    app.use(require('./ratelimit').get(config));
    app.use(require('./slowdown').get(config));
    // console.log request logger
    if(config.verbose) {
        const RequestLogger = require('./request_logger')
        app.use(RequestLogger());
    }
        
    // credentials validation
    const JsonKeyValidator = require('./json-validator');
    app.use('/data', JsonKeyValidator(['username', 'password']));
    const UserLoginValidator = require('./login-validator')
    app.use('/data', UserLoginValidator(app.locals.users))
}}