var FPS = 60;

var canvas;
var ctx;
var game;

var Game = function() {
    this.f = 0;

    this.totemPoles = [];
    this.totemPoleColors = ['red', 'blue', 'green', 'yellow'];

    var startPoleX = 0,
        startPoleY = 10,
        startBlockX = 10,
        startBlockY = 10;


    for(var i = 0; i < 4; i++) {
        this.totemPoles.push(new TotemPole({x: startPoleX += 100, y: startPoleY}));

        for(var j = 0; j < 10; j++) {
           this.totemPoles[i].blocks.push(new TotemBlock({x: startPoleX, y: startBlockY += 50}));
        }

        startBlockY = 10;
    }
};

// This runs at fixed 60 FPS
Game.prototype.update = function() {
    this.f += 0.5;
    if (this.f > 100) {
        this.f = 0;
    }

};

Game.prototype.render = function() {

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for(var i = 0; i < this.totemPoles.length; i++) {
        ctx.fillStyle = this.totemPoleColors[i];
        
        for(var j = 0; j < this.totemPoles[i].blocks.length; j++) {
            ctx.fillRect(this.totemPoles[i].blocks[j].x, this.totemPoles[i].blocks[j].y, this.totemPoles[i].blocks[j].width, this.totemPoles[i].blocks[j].height);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 5;
            ctx.strokeRect(this.totemPoles[i].blocks[j].x, this.totemPoles[i].blocks[j].y, this.totemPoles[i].blocks[j].width, this.totemPoles[i].blocks[j].height);
        }
    }
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
