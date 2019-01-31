var path = require('path');

module.exports = {
    use: function(app) {
        // Route for Registering new users (if config allows it)
        app.post('/user/register', function (req, res) {
            if(app.locals.config.allow_registering) {   
                var username = req.body.username
                var password = req.body.password

                app.locals.users.register(username, password, function(error, msg) {
                    if(error) res.status(400);
                    res.send({"error" : error, "message": msg, username: username})
                });
            } else {
                res.status(400).send("400 - Registering not allowed");
            }
        });

        // ui for registering new users (if config allows it)
        app.get('/user/register', function(req, res) {
            if(app.locals.config.show_register_ui) {
                res.sendFile(
                    path.join(__dirname + '/ui/register.html')
                );
            } else {
                res.status(404).send('Not found');
            }
        });
    }
}