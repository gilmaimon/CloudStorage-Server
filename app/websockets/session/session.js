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

    sendError(params) {
        this._connection.send(
            JSON.stringify({
                error: true, 
                message: params.message,
                type: params.type
            })
        );
    }

    sendSuccess(params) {
        this._connection.send(JSON.stringify({
            error: false,
            type: params.type,
            result: params.result,
            message: params.message
        }));
    }

    onMessage(message) {
        if (message.type !== 'utf8') {
            this.sendError({
                type: 'bad-request',
                message: 'Bad message. Type must be utf8'
            });
            return;
        }
        
        let msg;
        try {
            msg = JSON.parse(message.utf8Data);
        } catch (err) {
            this.sendError({
                type: 'bad-request',
                message: 'Bad message. Body must be a valid JSON'
            });
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