let hash = require('object-hash');

class UnauthenticatedState {
    constructor(parent, manager, users) {
        console.log("New unauth user");
        this.parent = parent;
        this.manager = manager;
        this.users = users;

        this.parent.sendSuccess('ready', null);
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
                that.parent.sendSuccess('login', "Successfully Logged in as " + username);
                that.callback(user);
            } else {
                that.parent.sendError("Bad credentials. Could not log in.")
            }
        })
    }
    
    isAuthenticated() {
        return false;
    }

    onClosed() {
        this.manager.onSessionClosed(this.parent);
    }
    
}

class LoggedInState {
    constructor(parent, manager, user) {
        console.log("Logged in user " + user.username);
        this.parent = parent;
        this.manager = manager;
        this.user = user;
    }

    handleMessage(message) {
        if (message.type == 'listen' && message.key != null) {
            this.manager.addListener(this.parent, message.key);
            this.parent.sendSuccess("Successfully listening to key: " + message.key);
        } else {
            this.parent.sendError("Bad command type");
        }
    }

    notifyKeyChanged(changedKey, newValue) {
        console.log("state notify");
        this.parent.sendSuccess('key-changed', {key: changedKey, value: newValue});
    }

    isAuthenticated() {
        return true;
    }

    onClosed() {
        this.manager.onSessionClosed(this.parent, this.user.username);
    }
}
    
module.exports = class Session {
    constructor(users, connection, manager) {
        console.log("Session created");
        this.sessionId = hash(connection);
        this._connection = connection;
        this._state = new UnauthenticatedState(this, manager, users);

        let that = this;
        this._state.onLogin(function (user) {
            that._state = new LoggedInState(that, manager, user);
            manager.onSessionAuthenticated(that, user);
        });

        this.active = true;
        this._connection.on('message', this.onMessage.bind(this));
        this._connection.on('close', this.onClosed.bind(this));
    }

    sendErroror(errMsg) {
        this._connection.send(
            JSON.stringify({
                error: true, 
                message: errMsg
            })
        );
    }

    sendSuccess(type, result) {
        this._connection.send(JSON.stringify({
            error: false,
            type: type,
            result: result
        }));
    }

    onMessage(message) {
        if (message.type !== 'utf8') {
            this.sendError("Bad message. must be utf8");
            return;
        }
        
        let msg;
        try {
            msg = JSON.parse(message.utf8Data);
            this._state.handleMessage(msg);
        } catch (err) {
            this.sendError("Bad message. Body must be a valid JSON");
        }
    }

    notifyKeyChanged(changedKey, newValue) {
        console.log("parent notify");
        this._state.notifyKeyChanged(changedKey, newValue);
    }

    onClosed() {
        console.log("Session closed");
        this._state.onClosed();
        this.active = false;
    }

    isActive() {
        return this.active;
    }

    isAuthenticated() {
        return this._state.isAuthenticated();
    }
}