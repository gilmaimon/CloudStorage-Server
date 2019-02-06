module.exports = class LoggedInState {
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