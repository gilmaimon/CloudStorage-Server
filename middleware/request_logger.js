module.exports = function RequestLogger() {
    return function(req, res, next) {
        console.log("New Client (" + req.ip + "), " + 
            req.protocol + " " + req.method + 
            " request for: " + req.originalUrl); 
        console.log("- Body: " + JSON.stringify(req.body))   
        next();
    };
}