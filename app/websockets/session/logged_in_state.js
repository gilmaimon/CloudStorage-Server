class KeysTrie {
    constructor(isEnd = false) {
        this.isEnd = isEnd;
        this.children = {}
    }

    add(keys) {
        let primary = keys[0];
        keys.shift(); // removes the first key

        if(keys.length == 0) {
            this.children[primary] = new KeysTrie(true);
        } else {
            if(this.children[primary] == null) {    
                this.children[primary] = new KeysTrie(false);
            }
            this.children[primary].add(keys);
        }
    }
    
    has(keys) {
        let primary = keys[0];
        keys.shift(); // removes the first key
        
        if(this.children['*'] != null || this.isEnd == true) return true;
        
        if(this.children[primary] == null) {
            return false;
        }
        if(keys.length == 0) {
            return this.children[primary].isEnd;
        }
        return this.children[primary].has(keys);
    }
}

function parseSubkeys(key) {
    let subkeys = key.split('.');
    subkeys = subkeys.filter(key => isNaN(parseInt(key, 10)));
    return subkeys;
}

class ListenedKeys {
    constructor() {
        this.keys = new KeysTrie();
    }

    listenTo(key) {
        let subkeys = parseSubkeys(key);
        this.keys.add(subkeys);
    }
    
    has(key) {
        let subkeys = parseSubkeys(key);
        return this.keys.has(subkeys);
    }
}

module.exports = class LoggedInState {
    constructor(parent, manager, user) {
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
        if(this.keys.has(changedKey)) {
            this.parent.sendSuccess('value-changed', {key: parseSubkeys(changedKey).join('.'), value: newValue});
        }
    }

    isAuthenticated() {
        return true;
    }

    onClosed() {
        this.manager.onSessionClosed(this.parent, this.user.username);
    }
}