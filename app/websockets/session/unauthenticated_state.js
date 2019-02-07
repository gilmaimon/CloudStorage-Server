module.exports = class UnauthenticatedState {
    constructor(parent, manager, users) {
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
        } else {
            this.parent.sendError("Bad command type");
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