module.exports = function validator() {
    return function(req, res, next) {
        var username = req.body.username;
        var password = req.body.password;

        req.app.locals.users.login(username, password, function(loginSuccess, user) {
            if(loginSuccess) {
                delete req.body.password;
                req.userObj = user;
                next()
            }
            else {
                res.status(401);
                res.send({error: true, message: '401: Access Denied - Bad Credentials.'});
            }
        }) 
    }
}