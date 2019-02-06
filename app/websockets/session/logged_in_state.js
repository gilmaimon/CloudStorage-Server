class KeysTrie {
    constructor(isEnd = false) {
        this.isEnd = isEnd;
        this.children = {}
    }

    add(keys) {
        let primary = keys[0];
        keys.shift(); // removes the first key
        console.log("A call to add: ");
        console.log("Primary is: " + primary);
        console.log("Leftovers: ");
        console.log(keys);
        
        if(keys.length == 0) {
            console.log("Nothing left, adding node with true");
            this.children[primary] = new KeysTrie(true);
            console.log("Children Now: ");
            console.log(this.children);
        } else {
            console.log("Some left");
            if(this.children[primary] == null) {    
                console.log("Creating new node for primary");
                this.children[primary] = new KeysTrie(false);
                console.log("Done, children Now: ");
                console.log(this.children);
            }
            console.log("Calling add on children");
            this.children[primary].add(keys);
        }
    }
    
    has(keys) {
        console.log("Calling has");
        let primary = keys[0];
        keys.shift(); // removes the first key
        console.log("Primary is: " + primary);
        console.log("Leftovers: ");
        console.log(keys);
        console.log("Children: ");
        console.log(this.children);

        if(this.isEnd == true) return true;
        
        if(this.children[primary] == null) {
            console.log("no such subkey exist in current node, returning false");
            return false;
        }
        if(keys.length == 0) {
            console.log("Node exists, returning his isEnd");
            return this.children[primary].isEnd;
        }
        console.log("Calling `has` on child");
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
            this.parent.sendSuccess('key-changed', {key: parseSubkeys(changedKey).join('.'), value: newValue});
        }
    }

    isAuthenticated() {
        return true;
    }

    onClosed() {
        this.manager.onSessionClosed(this.parent, this.user.username);
    }
}