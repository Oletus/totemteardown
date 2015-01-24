var FPS = 60;

var canvas;
var ctx;
var game;

var Game = function() {
    this.f = 0;
    this.block = new TotemBlock({});
    
    this.gamepads = new Gamepads(this);
    this.gamepads.addButtonDownListener(0, this.gamepadPressed);
};

Game.prototype.gamepadPressed = function(playerNumber) {
    if (playerNumber === 0) {
        this.block.y -= 100;
    } else {
        this.block.y += 100;
    }
};

// This runs at fixed 60 FPS
Game.prototype.update = function() {
    this.gamepads.update();

    this.block.y += 1;
    if (this.block.y > 600) {
        this.block.y = 0;
    }
};

Game.prototype.render = function() {

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, this.block.y, this.block.width, this.block.height);
};

var webFrame = function() {
    var time = new Date().getTime();
    var updated = false;
    var updates = 0;
    if (time - nextFrameTime > 500) {
        nextFrameTime = time - 500;
    }
    while (time > nextFrameTime) {
        nextFrameTime += 1000 / FPS;
        game.update();
        updates++;
    }
    /*if (updates > 1) {
        console.log('dropped ' + (updates - 1) + ' frames');
    }*/
    if (updates > 0) {
        game.render();
    }
    requestAnimationFrame(webFrame);
};

var initGame = function() {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    game = new Game();
    
    nextFrameTime = new Date().getTime() - 1000 / FPS * 0.5;
    webFrame();
};
