class ListenedKeys {
    constructor() {
        this.keys = new Set([]);
    }

    listenTo(key) {
        this.keys.add(key);
    }

    has(key) {
        return this.keys.has(key);
    }
}

module.exports = class LoggedInState {
    constructor(parent, manager, user) {
        console.log("Logged in user " + user.username);
        this.parent = parent;
        this.manager = manager;
        this.user = user;
        this.keys = new ListenedKeys();
    }

    handleMessage(message) {
        if (message.type == 'listen' && message.key != null) {
            this.keys.listenTo(message.key);
            this.parent.sendSuccess("Successfully listening to key: " + message.key);
        } else {
            this.parent.sendError("Bad command type");
        }
    }

    notifyKeyChanged(changedKey, newValue) {
        console.log("state notify");
        if(this.keys.has(changedKey)) {
            this.parent.sendSuccess('key-changed', {key: changedKey, value: newValue});
        }
    }

    isAuthenticated() {
        return true;
    }

    onClosed() {
        this.manager.onSessionClosed(this.parent, this.user.username);
    }
}