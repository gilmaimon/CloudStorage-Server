module.exports = class SessionsManager {
    constructor() {
        this.unautenticatedSessions = new Set([])
        this.sessionIdToListenedKeys = {}
        this.usernameToSessions = {}
        this.sessionIdToUsernames = {}
    }
    
    notifyKeyChanged(username, key) {
        console.log("notify changed")
        let usersSessions = this.usernameToSessions[username];
        for(let iSession = 0; iSession < usersSessions.length; iSession++) {
            let session = usersSessions[iSession];
            if(this.sessionIdToListenedKeys[session.sessionId].has(key)) {
                session.notifyKeyChanged(key);
            }
        }
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
            this.usernameToSessions[user.username].push(session);
        } else {
            this.usernameToSessions[user.username] = [session]
        }

        this.sessionIdToUsernames[session.sessionId] = user.username;
        this.log();
    }

    onNewSession(session) {
        console.log("on new session")
        this.unautenticatedSessions.add(session);
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