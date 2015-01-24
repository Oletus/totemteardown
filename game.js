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

    this.cursor = new Cursor({x: 98, y: 58});

    for(var i = 0; i < 4; i++) {
        this.totemPoles.push(new TotemPole({x: startPoleX += 100, y: startPoleY}));

        for (var j = 0; j < 10; j++) {
            this.totemPoles[i].blocks.push(new TotemBlock({x: startPoleX, y: startBlockY += 50, value: j + 1}));
        }

        startBlockY = 10;
    }

    this.gamepads = new Gamepads(this);
    this.gamepads.addButtonDownListener(13, this.moveCursorDown);
    this.gamepads.addButtonDownListener(12, this.moveCursorUp);
    this.gamepads.addButtonDownListener(0, this.selectBlock);
    this.gamepads.addButtonDownListener(1, this.deselectBlock);
};

Game.prototype.moveCursorDown = function(playerNumber) {
    if(!this.cursor.selected) {
        this.cursor.y += 50;
        this.cursor.index++;     
    } else {
        var prevIndex = this.cursor.index++;
        var currentIndexValue = this.totemPoles[0].blocks[this.cursor.index].value;
        var prevIndexValue = this.totemPoles[0].blocks[prevIndex].value;
        this.totemPoles[0].blocks[this.cursor.index].value = prevIndexValue;
        this.totemPoles[0].blocks[prevIndex].value = currentIndexValue;
        this.cursor.selected = false;
        this.cursor.index = currentIndexValue;
    }
};

Game.prototype.moveCursorUp = function(playerNumber) {
    if(!this.cursor.selected) {
        this.cursor.y -= 50;
        this.cursor.index--;
    } else {
        var prevIndex = this.cursor.index--;
        var currentIndexValue = this.totemPoles[0].blocks[this.cursor.index].value;
        var prevIndexValue = this.totemPoles[0].blocks[prevIndex].value;
        this.totemPoles[0].blocks[this.cursor.index].value = prevIndexValue;
        this.totemPoles[0].blocks[prevIndex].value = currentIndexValue;
        this.cursor.selected = false;
        this.cursor.index = currentIndexValue;
    }
};

Game.prototype.selectBlock = function() {
    this.cursor.selected = true;
};

Game.prototype.deselectBlock = function() {
    this.cursor.selected = false;
};

// This runs at fixed 60 FPS
Game.prototype.update = function() {
   this.gamepads.update();
};

Game.prototype.render = function() {

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for(var i = 0; i < this.totemPoles.length; i++) {
        for(var j = 0; j < this.totemPoles[i].blocks.length; j++) {
            ctx.fillStyle = this.totemPoleColors[i];
            ctx.fillRect(this.totemPoles[i].blocks[j].x, this.totemPoles[i].blocks[j].y, this.totemPoles[i].blocks[j].width, this.totemPoles[i].blocks[j].height);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 5;
            ctx.strokeRect(this.totemPoles[i].blocks[j].x, this.totemPoles[i].blocks[j].y, this.totemPoles[i].blocks[j].width, this.totemPoles[i].blocks[j].height);
            ctx.fillStyle = 'black';
            ctx.fillText(this.totemPoles[i].blocks[j].value, this.totemPoles[i].blocks[j].x + 22, this.totemPoles[i].blocks[j].y + 25);
        }
    }

    if(this.cursor.selected) {
        ctx.strokeStyle = '#FFFF00';
    } else {
        ctx.strokeStyle = '#00FF00';    
    }
    
    ctx.lineWidth = 5;
    ctx.strokeRect(this.cursor.x, this.cursor.y, this.cursor.width, this.cursor.height);
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
