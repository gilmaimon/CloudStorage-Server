module.exports = class SessionsManager {
    constructor() {
        this.unautenticatedSessions = new Set([])
        this.sessionIdToListenedKeys = {}
        this.usernameToSessions = {}
        this.sessionIdToUsernames = {}
    }
    
    notifyKeyChanged(username, changedKey, newValue) {
        let usersSessions = this.usernameToSessions[username];
        if(!usersSessions) return;
        usersSessions.forEach((session) => {
            let exactKeyIsListenedTo = this.sessionIdToListenedKeys[session.sessionId].has(changedKey);
            if(exactKeyIsListenedTo) {
                session.notifyKeyChanged(changedKey, newValue);
            }
        })
    }

    addListener(session, key) {
        console.log("add listener")
        this.sessionIdToListenedKeys[session.sessionId].add(key)
        this.log();
    }

    onSessionAuthenticated(session, user) {
        console.log("on session autenticated")
        this.unautenticatedSessions.delete(session);

        this.sessionIdToListenedKeys[session.sessionId] = new Set([])
        if(this.usernameToSessions[user.username]) {
            this.usernameToSessions[user.username].add(session);
        } else {
            this.usernameToSessions[user.username] = new Set([session]);
        }

        this.sessionIdToUsernames[session.sessionId] = user.username;
        this.log();
    }

    onNewSession(session) {
        console.log("on new session")
        this.unautenticatedSessions.add(session);
        this.log();
    }

    onSessionClosed(session, username) {
        console.log("Session closed");
        if(session.isAuthenticated()) {
            this.usernameToSessions[username].delete(session);
            delete this.sessionIdToListenedKeys[session.sessionId]
            delete this.sessionIdToUsernames[session.sessionId]
        } else {
            this.unautenticatedSessions.delete(session);
        }
        this.log();
    }

    log() {
        console.log("---------------------")
        console.log("Unauth sessions: ");
        console.log(this.unautenticatedSessions);
        console.log("Session ids to keys: ");
        console.log(this.sessionIdToListenedKeys);
        console.log("username to sessions: ");
        console.log(this.usernameToSessions);
        console.log("sessionid to usernames: ");
        console.log(this.sessionIdToUsernames);
        console.log("---------------------")
    }
}