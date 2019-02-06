let hash = require('object-hash');    
const UnauthenticatedState = require('./unauthenticated_state')
const LoggedInState = require('./logged_in_state')

module.exports = class Session {
    constructor(users, connection, manager) {
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

    sendError(errMsg) {
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
        } catch (err) {
            this.sendError("Bad message. Body must be a valid JSON");
            return;
        }

        this._state.handleMessage(msg);
    }

    notifyKeyChanged(changedKey, newValue) {
        this._state.notifyKeyChanged(changedKey, newValue);
    }

    onClosed() {
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