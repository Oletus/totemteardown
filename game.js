var FPS = 60;

var canvas;
var ctx;
var game;

var Game = function() {
    this.f = 0;

    this.totemPoles = [];
    this.totemPoleColors = ['red', 'blue', 'green', 'yellow'];

    var startPoleX = ctx.canvas.width * 0.5 - POLE_DISTANCE * (POLE_COUNT - 1) * 0.5;
        startPoleY = 550,
        startBlockY = 10;

    this.cursors = [];

    for(var i = 0; i < 4; i++) {
        this.totemPoles.push(new TotemPole({x: startPoleX, y: startPoleY, color: this.totemPoleColors[i]}));
        startBlockY = startPoleY - STARTING_BLOCKS * BLOCK_HEIGHT * 1.5;
        for (var j = 0; j < STARTING_BLOCKS; j++) {
            startBlockY += BLOCK_HEIGHT * 1.5;
            this.totemPoles[i].blocks.push(new TotemBlock({x: startPoleX, y: startBlockY, type: TotemBlock.randomType()}));
        }
        startPoleX += POLE_DISTANCE;
    }

    this.gamepads = new Gamepads(this);
    this.gamepads.addButtonDownListener(13, this.moveCursorDown);
    this.gamepads.addButtonDownListener(12, this.moveCursorUp);
    this.gamepads.addButtonDownListener(0, this.selectBlock);
    this.gamepads.addButtonDownListener(1, this.deselectBlock);
    //this.gamepads.addButtonDownListener(2, this.removeBlock);
};

Game.prototype.cursorActive = function(playerNumber) {
    while (this.cursors.length <= playerNumber) {
        this.cursors.push(new Cursor({block: 0, pole: playerNumber}));
    }
    return this.cursors[playerNumber];
};

Game.prototype.clampCursor = function(cursor) {
    if (cursor.block >= this.totemPoles[cursor.pole].blocks.length) {
        cursor.block = this.totemPoles[cursor.pole].blocks.length - 1;
    }
    if (cursor.block < 0) {
        cursor.block = 0;
    }
};

Game.prototype.swap = function(pole, blockA, blockB) {
    var poleObj = this.totemPoles[pole];
    var a = poleObj.blocks[blockA];
    var b = poleObj.blocks[blockB];
    if (a.state == TotemBlock.SUPPORTED && b.state == TotemBlock.SUPPORTED) {
        poleObj.blocks.splice(blockA, 1, b);
        poleObj.blocks.splice(blockB, 1, a);
        a.state = TotemBlock.SWAPPING;
        b.state = TotemBlock.SWAPPING;
    }
};

Game.prototype.moveCursorDown = function(playerNumber) {
    var cursor = this.cursorActive(playerNumber);
    if(!cursor.selected) {
        cursor.block++;
        this.clampCursor(cursor);
    } else {
        if (cursor.block < this.totemPoles[cursor.pole].blocks.length - 1) {
            var topBlock = cursor.block;
            var bottomBlock = cursor.block + 1;
            this.swap(cursor.pole, topBlock, bottomBlock);
            cursor.block++;
        }
        cursor.selected = false;
    }
};

Game.prototype.moveCursorUp = function(playerNumber) {
    var cursor = this.cursorActive(playerNumber);
    if(!cursor.selected) {
        cursor.block--;
        this.clampCursor(cursor);
    } else {
        if (cursor.block > 0) {
            var topBlock = cursor.block - 1;
            var bottomBlock = cursor.block;
            this.swap(cursor.pole, topBlock, bottomBlock);
            cursor.block--;
        }
        cursor.selected = false;
    }
};

Game.prototype.selectBlock = function(playerNumber) {
    var cursor = this.cursorActive(playerNumber);
    cursor.selected = true;
};

Game.prototype.deselectBlock = function(playerNumber) {
    var cursor = this.cursorActive(playerNumber);
    cursor.selected = false;
};

Game.prototype.removeBlock = function(playerNumber) {
    var cursor = this.cursorActive(playerNumber);
    this.totemPoles[cursor.pole].blocks.splice(cursor.block, 1);
    this.clampCursor(cursor);
};

// This runs at fixed 60 FPS
Game.prototype.update = function() {
   var i;
   this.gamepads.update();
   for(i = 0; i < this.totemPoles.length; i++) {
       this.totemPoles[i].update();
   }
};

Game.prototype.render = function() {
    var i;
    ctx.fillStyle = '#def';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (i = 0; i < this.totemPoles.length; i++) {
        this.totemPoles[i].render();
    }

    for (i = 0; i < this.cursors.length; ++i) {
        var cursor = this.cursors[i];
        if(cursor.selected) {
            ctx.strokeStyle = '#FFFF00';
        } else {
            ctx.strokeStyle = '#00FF00';    
        }
        ctx.lineWidth = 5;
        if (this.totemPoles[cursor.pole].blocks.length > cursor.block) {
            var block = this.totemPoles[cursor.pole].blocks[cursor.block];
            canvasUtil.strokeCenteredRect(ctx, block.x, block.y, cursor.width, cursor.height);
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
