module.exports = {
    attach: function(app) {
        if(app.locals.config.verbose == false) return;
        app.use(function(req, res, next) {
            console.log("New Client (" + req.ip + "), " + 
                req.protocol + " " + req.method + 
                " request for: " + req.originalUrl); 
            console.log("- Body: " + JSON.stringify(req.body))   
            next();
        });
    }
}