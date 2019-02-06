let hash = require('object-hash');    
const UnauthenticatedState = require('./unauthenticated_state')
const LoggedInState = require('./logged_in_state')

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