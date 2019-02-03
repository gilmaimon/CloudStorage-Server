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
    constructor(parent, user, manager) {
        console.log("Logged in user " + user.username);
        this.parentSession = parent;
        this.user = user;
        this.manager = manager;
    }

    handleMessage(message) {
        if(message.type == 'listen' && message.key != null) {
            this.manager.addListener(this.parentSession, message.key);
        } else if(message.type == 'notify-debug' && message.key != null) {
            this.manager.notifyKeyChanged(this.user.username, message.key);
        }
    }

    notifyKeyChanged(key) {
        this.parentSession.connection.send(
            JSON.stringify({
                type: 'key-changed',
                key: key
            })
        )
    }
}

module.exports = class Session {
    constructor(users, connection, manager) {
        console.log("Session created");
        this.sessionId = hash(connection);
        this.connection = connection;
        this.state = new UnauthenticatedState(users, connection);
        this.manager = manager;
        let that = this;
        this.state.onLogin(function(user){
            that.state = new LoggedInState(that, user, manager);
            that.manager.onSessionAuthenticated(that, user);
        });

        this.active = true;
        connection.on('message', this.onMessage.bind(this));
        connection.on('close', this.onClosed.bind(this));
    }

    onMessage(message) {
        if (message.type !== 'utf8') {
            this.connection.send(
                JSON.stringify({
                    error: true,
                    message: "Bad message. must be utf8"
                })
            );
            return;
        }
        let msg;
        try {
            msg = JSON.parse(message.utf8Data);
        } catch (err) {
            this.connection.send(
                JSON.stringify({
                    error: true,
                    message: "Bad message. Body must be a valid JSON"
                })
            );
            return;
        }

        this.state.handleMessage(msg);
    }

    notifyKeyChanged(key) {
        this.state.notifyKeyChanged(key);
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