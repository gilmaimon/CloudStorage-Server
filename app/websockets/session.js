let hash = require('object-hash');

class UnauthenticatedState {
    constructor(users, connection) {
        console.log("New unauth user");
        this.users = users;
        this.connection = connection;
    }
    
    onLogin(callback) {
        this.callback = callback;
    }
    
    handleMessage(message) {
        if (message.type === 'login') {
            this.authenticate(message.username, message.password);
        }
    }
    
    authenticate(username, password) {
        let that = this;
        this.users.login(username, password, function (success, user) {
            if (success) {
                that.callback(user);
            }
        })
    }
}

class LoggedInState {
    constructor(connection, user) {
        console.log("Logged in user " + user.username);
        this.user = user;
        this.connection = connection;
    }

    handleMessage(message) {
        console.log(message)
    }
}

module.exports = class Session {
    constructor(users, connection) {
        console.log("Session created");
        this.sessionId = hash(connection);
        this.state = new UnauthenticatedState(users, connection);
        
        let that = this;
        this.state.onLogin(function(user){
            that.state = new LoggedInState(that.state.connection, user);
        });

        this.active = true;
        connection.on('message', this.onMessage.bind(this));
        connection.on('close', this.onClosed.bind(this));
    }

    onMessage(message) {
        if (message.type !== 'utf8') {
            this.state.connection.send(
                JSON.stringify({
                    error: true,
                    message: "Bad message. must be utf8"
                })
            );
        }
        try {
            let msg = JSON.parse(message.utf8Data);
            this.state.handleMessage(msg);
        } catch (err) {
            this.state.connection.send(
                JSON.stringify({
                    error: true,
                    message: "Bad message. Body must be a valid JSON"
                })
            );
        }
    }

    onClosed() {
        console.log("Session closed");
        this.active = false;
    }

    isAuthenticated() {
        return this.state instanceof LoggedInState;
    }

    isActive() {
        return this.active;
    }
}