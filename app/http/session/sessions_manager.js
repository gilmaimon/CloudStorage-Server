const PING_CLIENT_INTERVAL_IN_MS = 1000 * 5;

module.exports = class SessionsManager {
    constructor() {
        this.unautenticatedSessions = new Set([])
        this.usernameToSessions = {}
        this.sessionIdToUsernames = {}
    }
    
    notifyKeyChanged(username, changedKey, newValue) {
        let usersSessions = this.usernameToSessions[username];
        if(!usersSessions) return;
        usersSessions.forEach((session) => {
            session.notifyKeyChanged(changedKey, newValue);
        })
    }

    onSessionAuthenticated(session, user) {
        this.unautenticatedSessions.delete(session);

        if(this.usernameToSessions[user.username]) {
            this.usernameToSessions[user.username].add(session);
        } else {
            this.usernameToSessions[user.username] = new Set([session]);
        }

        this.sessionIdToUsernames[session.sessionId] = user.username;
    }

    onNewSession(session) {
        this.unautenticatedSessions.add(session);

        let intervalId = setInterval(function(){
            if(session.isActive()) {
                session.ping();
            } else {
                clearInterval(intervalId);   
            }
        }, PING_CLIENT_INTERVAL_IN_MS);
    }

    onSessionClosed(session, username) {
        if(session.isAuthenticated()) {
            this.usernameToSessions[username].delete(session);
            delete this.sessionIdToUsernames[session.sessionId]
        } else {
            this.unautenticatedSessions.delete(session);
        }
    }
}