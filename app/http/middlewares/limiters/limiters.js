module.exports = {
    attach: function(app) {
        app.use(require('./ratelimit').get(app.locals.config));
        app.use(require('./slowdown').get(app.locals.config));    
    }
}