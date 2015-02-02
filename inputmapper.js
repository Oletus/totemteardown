"use strict";

/**
 * Mapper that automatically maps keyboard / gamepad input to different player numbers.
 * @param {Object} callbackObj Object on which the callback functions will be called.
 * @param {number} maxPlayers Maximum number of players. If there are more active controllers
 * than this, then two controllers may be mapped to the same player.
 */
var InputMapper = function(callbackObj, maxPlayers) {
    this.gamepads = new Gamepads(this);
    this.callbackObj = callbackObj;
    this.maxPlayers = maxPlayers;
    this.players = [];
    this.keysDown = []; // Keyboard keys that are currently down
    this.callbacks = []; // Callback information for mapping callbacks back to buttons
};

// Controller types
InputMapper.GAMEPAD = 0;
InputMapper.KEYBOARD = 1;

/**
 * Helper class to store the controller config each player has.
 */
InputMapper.Player = function(controllerType, controllerIndex) {
    this.controllerType = controllerType;
    this.controllerIndex = controllerIndex;
};

/**
 * Reset the map between controllers and player numbers.
 */
InputMapper.prototype.resetPlayerMap = function() {
    this.players = [];
};

InputMapper.prototype.update = function() {
    this.gamepads.update();
};

/**
 * Return a player index for a player using a given controller.
 */
InputMapper.prototype.getPlayerIndex = function(controllerType, controllerIndex) {
    for (var i = 0; i < this.players.length; ++i) {
        var player = this.players[i];
        if (player.controllerType == controllerType && player.controllerIndex == controllerIndex) {
            return i % this.maxPlayers;
        }
    }
    this.players.push(new InputMapper.Player(controllerType, controllerIndex));
    return (this.players.length - 1) % this.maxPlayers;
}
/**
 * @param {number} gamepadButton A button from Gamepads.BUTTONS
 * @param {Array} keyboardBindings List of bindings for different players, for example ['up', 'w']
 * @param {function} downCallback Callback when the button is pressed down, that takes a player number as a parameter.
 * @param {function} upCallback Callback when the button is released, that takes a player number as a parameter.
 */
InputMapper.prototype.addListener = function(gamepadButton, keyboardButtons, downCallback, upCallback) {
    var gamepadDownCallback = function(gamepadNumber) {
        var player = this.getPlayerIndex(InputMapper.GAMEPAD, gamepadNumber);
        if (downCallback !== undefined) {
            downCallback.call(this.callbackObj, player);
        }
    };
    var gamepadUpCallback = function(gamepadNumber) {
        var player = this.getPlayerIndex(InputMapper.GAMEPAD, gamepadNumber);
        if (upCallback !== undefined) {
            upCallback.call(this.callbackObj, player);
        }
    };
    this.gamepads.addButtonChangeListener(gamepadButton, gamepadDownCallback, gamepadUpCallback);

    if (downCallback !== undefined) {
        this.callbacks.push({key: Gamepads.BUTTON_INSTRUCTION[gamepadButton], callback: downCallback, controllerType: InputMapper.GAMEPAD});
    }
    if (upCallback !== undefined) {
        this.callbacks.push({key: Gamepads.BUTTON_INSTRUCTION[gamepadButton], callback: upCallback, controllerType: InputMapper.GAMEPAD});
    }

    var that = this;
    for (var i = 0; i < keyboardButtons.length; ++i) {
        (function(kbIndex) {
            that.keysDown[keyboardButtons[kbIndex]] = false;
            // TODO: down events get generated multiple times while a key is down. Work around this...
            var keyDownCallback = function() {
                var player = that.getPlayerIndex(InputMapper.KEYBOARD, kbIndex);
                if (!that.keysDown[keyboardButtons[kbIndex]]) {
                    that.keysDown[keyboardButtons[kbIndex]] = true;
                    if (downCallback !== undefined) {
                        downCallback.call(that.callbackObj, player);
                    }
                }
            };
            var keyUpCallback = function() {
                var player = that.getPlayerIndex(InputMapper.KEYBOARD, kbIndex);
                that.keysDown[keyboardButtons[kbIndex]] = false;
                if (upCallback !== undefined) {
                    upCallback.call(that.callbackObj, player);
                }
            };
            Mousetrap.bindGlobal(keyboardButtons[kbIndex], keyDownCallback, 'keydown');
            Mousetrap.bindGlobal(keyboardButtons[kbIndex], keyUpCallback, 'keyup');
        })(i);
        if (downCallback !== undefined) {
            this.callbacks.push({key: keyboardButtons[i], callback: downCallback, controllerType: InputMapper.KEYBOARD, kbIndex: i});
        }
        if (upCallback !== undefined) {
            this.callbacks.push({key: keyboardButtons[i], callback: upCallback, controllerType: InputMapper.KEYBOARD, kbIndex: i});
        }
    }
};

InputMapper.usesController = function(player, cbInfo) {
    if (cbInfo.controllerType === player.controllerType) {
        if (cbInfo.controllerType === InputMapper.KEYBOARD && player.controllerIndex !== cbInfo.kbIndex) {
            return false;
        }
        return true;
    }
};
/**
 * Get instruction for a key. Prioritizes gamepad over keyboard if keyboard hasn't been used.
 * @param {function} callback A callback that has been previously attached to a button.
 * @param {playerIndex} index of the player to return information for. Set to undefined if the listener doesn't care about the player number.
 * @return {string} String identifying the button for the player.
 */
InputMapper.prototype.getKeyInstruction = function(callback, playerIndex) {
    // TODO: Handle a player with two active controllers.
    var player;
    if (playerIndex !== undefined) {
        if (playerIndex < this.players.length) {
            player = this.players[playerIndex];
        } else {
            player = new InputMapper.Player(InputMapper.GAMEPAD, 0);
        }
    }
    var returnStr = [];
    for (var i = 0; i < this.callbacks.length; ++i) {
        var cbInfo = this.callbacks[i];
        if (cbInfo.callback === callback) {
            if (player === undefined) {
                for (var j = 0; j < this.players.length; ++j) {
                    if (InputMapper.usesController(this.players[j], cbInfo)) {
                        returnStr.push(cbInfo.key.toUpperCase());
                    }
                }
            } else {
                if (InputMapper.usesController(player, cbInfo)) {
                    return cbInfo.key.toUpperCase();
                }
            }
        }
    }
    if (player === undefined) {
        return returnStr.join('/');
    }
    return '';
};
