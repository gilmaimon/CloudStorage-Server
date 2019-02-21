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
    let subkeys = key.trim().split('.');
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

function includesAnyOf(str, chars) {
    chars.forEach((ch) => {
        if (str.includes(ch)) return true;
    })

    return false;
}

function isValidKey(key) {
    if (key == null) return false;
    key = key.trim();
    if (key.length == 0) return false;
        
    var validKeyRegex = /^(\*|[a-z_]+(\.[a-z0-9_ ]+)*)$/g;
    return key.match(validKeyRegex);
}

module.exports = class LoggedInState {
    constructor(parent, manager, user) {
        this.parent = parent;
        this.manager = manager;
        this.user = user;
        this.keys = new ListenedKeys();
    }

    handleMessage(message) {
        if (message.type == 'listen') {
            if(isValidKey(message.key)) {
                this.keys.listenTo(message.key);
                this.parent.sendSuccess({
                    type: 'listen', 
                    message: "Successfully listening to key: " + message.key
                });
            } else {
                this.parent.sendError({
                    type: 'listen',
                    message: 'Key is missing or invalid'
                });
            }
        } else {
            this.parent.sendError({
                type: 'unknown-command',
                message: 'Bad command type'
            });
        }
    }

    notifyKeyChanged(changedKey, newValue) {
        if(this.keys.has(changedKey)) {
            this.parent.sendSuccess({
                type: 'value-changed', 
                result: {
                    key: parseSubkeys(changedKey).join('.'), 
                    value: newValue
                }
            });
        }
    }

    isAuthenticated() {
        return true;
    }

    onClosed() {
        this.manager.onSessionClosed(this.parent, this.user.username);
    }
}