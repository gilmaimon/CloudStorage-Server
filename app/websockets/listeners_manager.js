class ListenersManager {
    constructor() {
        this.usernameToListenedKeys = {}
        this.usernameToSessions = {}
    }

    notifyKeyChanged(username, key) {
        let usersListenedKeys = this.usernameToListenedKeys[username];
        if (usersListenedKeys && usersListenedKeys.contains(key)) {
            let session = this.usernameToSessions[username];
            if(session) {
                session.notifyKeyChanged(key);
            }
        }
    }
}