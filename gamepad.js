var Gamepads = function(callbackObj) {
    this.downListeners = [];
    this.indexToPlayer = {};
    this.players = [];
    this.callbackObj = callbackObj;
};

Gamepads.prototype.gamepadForPlayer = function(gamepads, playerNumber) {
    for (var i = 0; i < gamepads.length; ++i) {
        if (gamepads[i].index === this.players[playerNumber]) {
            return gamepads[i];
        }
    }
    return null;
};

Gamepads.prototype.update = function() {
    var gamepads;
    if (navigator.getGamepads) {
        gamepads = navigator.getGamepads();
    } else if (navigator.webkitGetGamepads) {
        gamepads = navigator.webkitGetGamepads();
    }

    for (var i = 0; i < gamepads.length; ++i) {
        if (gamepads[i] !== undefined) {
            var key = 'index' + gamepads[i].index;
            if (!this.indexToPlayer.hasOwnProperty(key)) {
                this.indexToPlayer[key] = this.players.length;
                this.players.push(gamepads[i].index);
            }
        }
    }
    for (var i = 0; i < this.downListeners.length; ++i) {
        for (var p = 0; p < this.players.length; ++p) {
            var l = this.downListeners[i];
            var pad = this.gamepadForPlayer(gamepads, p);
            if (pad != null) {
                var value;
                if (pad.buttons[l.buttonNumber].hasOwnProperty('value')) {
                    value = pad.buttons[l.buttonNumber].value;
                } else {
                    value = pad.buttons[l.buttonNumber];
                }
                if (value > 0.6) {
                    if (!l.isDown[p]) {
                        l.isDown[p] = true;
                        l.callback.call(this.callbackObj, p);
                    }
                } else if (value < 0.1) {
                    l.isDown[p] = false;
                }
            }
        }
    }
};

Gamepads.prototype.addButtonDownListener = function(buttonNumber, callback) {
    this.downListeners.push({buttonNumber: buttonNumber, callback: callback, isDown: [false, false, false, false]});
};