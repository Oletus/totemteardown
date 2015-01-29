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
    var gamepadDownCallback = function(playerNumber) {
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

    var that = this;
    for (var i = 0; i < keyboardButtons.length; ++i) {
        (function(kbIndex) {
            // TODO: down events get generated multiple times while a key is down. Work around this...
            var keyDownCallback = function() {
                var player = that.getPlayerIndex(InputMapper.KEYBOARD, kbIndex);
                if (downCallback !== undefined) {
                    downCallback.call(that.callbackObj, player);
                }
            };
            var keyUpCallback = function() {
                var player = that.getPlayerIndex(InputMapper.KEYBOARD, kbIndex);
                if (upCallback !== undefined) {
                    upCallback.call(that.callbackObj, player);
                }
            };
            Mousetrap.bindGlobal(keyboardButtons[kbIndex], keyDownCallback, 'keydown');
            Mousetrap.bindGlobal(keyboardButtons[kbIndex], keyUpCallback, 'keyup');
        })(i);
    }
};
