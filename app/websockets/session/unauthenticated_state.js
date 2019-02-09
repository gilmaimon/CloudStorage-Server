module.exports = class UnauthenticatedState {
    constructor(parent, manager, users) {
        this.parent = parent;
        this.manager = manager;
        this.users = users;

        this.parent.sendSuccess({
            type: 'ready'
        });
    }
    
    onLogin(callback) {
        this.callback = callback;
    }
    
    handleMessage(message) {
        if (message.type === 'login') {
            this.authenticate(message.username, message.password);
        } else {
            this.parent.sendError({
                type: "unknown-command",
                message: "Bad command type"
            });
            
        }
    }
    
    authenticate(username, password) {
        let that = this;
        this.users.login(username, password, function (success, user) {
            if (success) {
                that.parent.sendSuccess({
                    type: 'login', 
                    message: "Successfully Logged in as " + username
                });
                that.callback(user);
            } else {
                that.parent.sendError({
                    type: 'login', 
                    message: "Bad credentials. Could not log in."
                });
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