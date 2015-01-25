var FPS = 60;

var canvas;
var ctx;
var game;

var Game = function() {
    this.f = 0;
    
    this.bg = new Sprite('BackgroundSky.png');
    this.fg = new Sprite('foreground.png');

    this.totemPoles = [];
    this.dynamicObjs = [];
    
    this.stateTime = 0;
    this.state = Game.START_COUNTDOWN;
    
    this.blockAppearTimer = BLOCK_APPEAR_INTERVAL - FIRST_BLOCK_APPEAR;
    this.appearPhase = 0;

    var startPoleX = ctx.canvas.width * 0.5 - POLE_DISTANCE * (POLE_COUNT - 1) * 0.5,
        startPoleY = GROUND_LEVEL;

    this.cursors = [];

    this.backgroundMusic = new Audio('music', true);

    if(SOUND_ON) {
        this.backgroundMusic.play();
    }

    this.explosionSound = new Audio('explosion', false);
    this.shieldSound = new Audio('shield', false);
    this.thunderSound = new Audio('thunder', false);

    for(var i = 0; i < POLE_COUNT; i++) {
        this.totemPoles.push(new TotemPole({x: startPoleX, y: startPoleY, color: i}));
        var startBlockY = startPoleY - STARTING_BLOCKS * BLOCK_HEIGHT * 1.5;
        for (var j = 0; j < STARTING_BLOCKS; j++) {
            startBlockY += BLOCK_HEIGHT * 1.5;
            var types = STARTING_TYPES[i % STARTING_TYPES.length];
            var type = TotemBlock.typeFromChar(types[j % types.length]);
            this.totemPoles[i].blocks.push(new TotemBlock({x: startPoleX, y: startBlockY, type: type}));
        }
        startPoleX += POLE_DISTANCE;
    }

    this.gamepads = new Gamepads(this);

    this.gamepads.addButtonChangeListener(Gamepads.BUTTONS.DOWN, this.moveCursorDown);
    this.gamepads.addButtonChangeListener(Gamepads.BUTTONS.UP, this.moveCursorUp);
    this.gamepads.addButtonChangeListener(Gamepads.BUTTONS.LEFT, this.cursorLeft);
    this.gamepads.addButtonChangeListener(Gamepads.BUTTONS.RIGHT, this.cursorRight);
    this.gamepads.addButtonChangeListener(Gamepads.BUTTONS.A, this.selectBlock, this.deselectBlock);
    this.gamepads.addButtonChangeListener(Gamepads.BUTTONS.X, this.activateBlock);
    addEventListener("keydown", this.debugMode, false);
};

Game.START_COUNTDOWN = 0;
Game.PLAYING = 1;

Game.cursorSprites = [
    new Sprite('cursor0.png'),
    new Sprite('cursor1.png'),
    new Sprite('cursor2.png'),
    new Sprite('cursor3.png')
];

Game.prototype.debugMode = function(e) {


    var debugPanel = document.getElementById("debug");

    if(e.keyCode === 68) {
        if(!DEBUG_MODE) {
            DEBUG_MODE = true;
            debugPanel.style.display = 'block';
        } else {
            DEBUG_MODE = false;
            debugPanel.style.display = 'none';
        }
    }

};

Game.prototype.cursorActive = function(playerNumber) {
    while (this.cursors.length <= playerNumber) {
        this.cursors.push(new Cursor({block: 0, pole: this.cursors.length}));
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

Game.prototype.clampAllCursors = function() {
    for (var i = 0; i < this.cursors.length; ++i) {
        this.clampCursor(this.cursors[i]);
    }
};

Game.prototype.getBlockTypeForPole = function(pole, types) {
    var tryIndex = this.appearPhase;
    var decided = false;
    while (!decided) {    
        var type = TotemBlock.typeFromChar(types[tryIndex % types.length]);
        decided = true;
        if (AVOID_CREATING_OVERREPRESENTED_BLOCKS) {
            if (pole.blockCount(type) >= pole.blocks.length * 0.49) {
                decided = false;
            }
        }
        ++tryIndex;
    }
    return type;
};

Game.prototype.spawnNewBlocks = function() {
    for (var i = 0; i < this.totemPoles.length; ++i) {
        var pole = this.totemPoles[i];
        if (pole.blocks.length <= VICTORY_BLOCKS) {
            var types = APPEAR_TYPES[i % APPEAR_TYPES.length];
            var type = this.getBlockTypeForPole(pole, types);
            pole.blocks.push(new TotemBlock({x: pole.x, y: pole.y + BLOCK_HEIGHT * 0.5, type: type, state: TotemBlock.APPEARING}));
        }
    }


    this.backgroundMusic.volume = 0.01;
    this.thunderSound.volume = 0.3;

    if(SOUND_ON) {
        this.thunderSound.play();
    }

    this.backgroundMusic.volume = 1;

    ++this.appearPhase;
};

Game.prototype.swap = function(pole, blockA, blockB) {
    if (this.state == Game.START_COUNTDOWN) {
        return false;
    }
    var poleObj = this.totemPoles[pole];
    var a = poleObj.blocks[blockA];
    var b = poleObj.blocks[blockB];
    if (a.state == TotemBlock.SUPPORTED && b.state == TotemBlock.SUPPORTED) {
        poleObj.blocks.splice(blockA, 1, b);
        poleObj.blocks.splice(blockB, 1, a);
        a.state = TotemBlock.SWAPPING;
        b.state = TotemBlock.SWAPPING;
        return true;
    }
    return false;
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
            if (this.swap(cursor.pole, topBlock, bottomBlock)) {
                cursor.block++;
            }
        }
        if (!HOLD_TO_SWAP) {
            cursor.selected = false;
        }
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
            if (this.swap(cursor.pole, topBlock, bottomBlock)) {
                cursor.block--;
            }
        }
        if (!HOLD_TO_SWAP) {
            cursor.selected = false;
        }
    }
};

Game.prototype.cursorLeft = function(playerNumber) {
    if (CAN_AIM_EAGLES) {
        var cursor = this.cursorActive(playerNumber);
        if (this.hasBlock(cursor.pole, cursor.block)) {
            var block = this.totemPoles[cursor.pole].blocks[cursor.block];
            if (block.type === TotemBlock.Type.SHOOTRIGHT) {
                block.type = TotemBlock.Type.SHOOTLEFT;
            }
        }
    }
};

Game.prototype.cursorRight = function(playerNumber) {
    if (CAN_AIM_EAGLES) {
        var cursor = this.cursorActive(playerNumber);
        if (this.hasBlock(cursor.pole, cursor.block)) {
            var block = this.totemPoles[cursor.pole].blocks[cursor.block];
            if (block.type === TotemBlock.Type.SHOOTLEFT) {
                block.type = TotemBlock.Type.SHOOTRIGHT;
            }
        }
    }
};

Game.prototype.hasBlock = function(pole, block) {
    return this.totemPoles[pole].blocks.length > block;
};

Game.prototype.selectBlock = function(playerNumber) {
    var cursor = this.cursorActive(playerNumber);
    cursor.selected = true;
};

Game.prototype.deselectBlock = function(playerNumber) {
    var cursor = this.cursorActive(playerNumber);
    if (HOLD_TO_SWAP) {
        cursor.selected = false;
    }
};

Game.prototype.removeBlock = function(playerNumber) {
    var cursor = this.cursorActive(playerNumber);
    this.totemPoles[cursor.pole].blocks.splice(cursor.block, 1);
    this.clampCursor(cursor);
};

Game.prototype.activeProjectiles = function(playerNumber) {
    var total = 0;
    for (var i = 0; i < this.dynamicObjs.length; ++i) {
        if (this.dynamicObjs[i].shooter == playerNumber) {
            ++total;
        }
    }
    return total;
};

Game.prototype.activateBlock = function(playerNumber) {
    if (this.state == Game.START_COUNTDOWN) {
        return;
    }
    var cursor = this.cursorActive(playerNumber);
    if (this.hasBlock(cursor.pole, cursor.block)) {

        var addedObjs = this.totemPoles[cursor.pole].blocks[cursor.block].activate(playerNumber, this.eagleRoar);
        if (this.activeProjectiles(playerNumber) < MAX_ACTIVE_PROJECTILES_PER_PLAYER) {
            this.dynamicObjs.push.apply(this.dynamicObjs, addedObjs);
        }
    }
};

// This runs at fixed 60 FPS
Game.prototype.update = function() {
    var i;
    this.gamepads.update();
   
    this.stateTime += 1/FPS;
    if (this.state === Game.START_COUNTDOWN) {
        if (this.stateTime > START_COUNTDOWN_DURATION) {
            this.state = Game.PLAYING;
            this.stateTime = 0;
        }
    }
   
   for(i = 0; i < this.totemPoles.length; i++) {
       this.totemPoles[i].update();
   }
   
    for (i = 0; i < this.dynamicObjs.length; ++i) {
        var obj = this.dynamicObjs[i];
        obj.update();
        if (obj.dead) {
            this.dynamicObjs.splice(i, 1);
        } else {
            var killBox = obj.killBox();
            for (var j = 0; j < this.totemPoles.length; ++j) {
                for (var k = 0; k < this.totemPoles[j].blocks.length; ++k) {
                    var block = this.totemPoles[j].blocks[k];
                    var hitBox = block.hitBox();
                    hitBox.intersectRect(killBox);
                    if (!hitBox.isEmpty()) {
                        var blocked = false;
                        if (block.type === TotemBlock.Type.SHIELD) {
                            if (BLOCK_BOTH_DIRECTIONS) {
                                blocked = true;
                            } else {
                                if (obj.velX < 0 && !block.facingLeft) {
                                    blocked = true;
                                }
                                if (obj.velX > 0 && block.facingLeft) {
                                    blocked = true;
                                }
                            }
                        }

                        if(blocked) {
                            if (block.hitpoints >= 0) {
                                block.hitpoints -= 1;
                                if (block.hitpoints <= 0) {
                                    blocked = false;
                                }
                            }
                            if(blocked && SOUND_ON) {
                                this.shieldSound.play();
                            }
                        }

                        if (!blocked) {

                            if(SOUND_ON) {
                                this.explosionSound.play();
                            }

                            this.totemPoles[j].blocks.splice(k, 1);
                            this.clampAllCursors();
                        }
                        this.dynamicObjs.splice(i, 1);
                    }
                }
            }
        }
    }
    
    this.blockAppearTimer += 1/FPS;
    if (BLOCK_APPEAR_INTERVAL > 0 && this.blockAppearTimer > BLOCK_APPEAR_INTERVAL) {
        this.blockAppearTimer = 0;
        this.spawnNewBlocks();
        BLOCK_APPEAR_INTERVAL -= BLOCK_APPEAR_INTERVAL_REDUCE;
        if (BLOCK_APPEAR_INTERVAL < BLOCK_APPEAR_INTERVAL_MIN) {
            BLOCK_APPEAR_INTERVAL = BLOCK_APPEAR_INTERVAL_MIN;
        }
    }
};

Game.prototype.render = function() {
    var i;
    //this.bg.fillCanvasFitBottom(ctx);
    this.bg.fillCanvas(ctx);
    //this.bg.draw(ctx, 0, 0);

    var victoryLineHeight = GROUND_LEVEL - VICTORY_BLOCKS * BLOCK_HEIGHT;
    ctx.fillStyle = '#f80';
    ctx.fillRect(0, victoryLineHeight, ctx.canvas.width, 2);

    for (i = 0; i < this.totemPoles.length; i++) {
        this.totemPoles[i].render();
    }

    for (i = 0; i < this.cursors.length; ++i) {
        var cursor = this.cursors[i];
        if (this.hasBlock(cursor.pole, cursor.block)) {
            var block = this.totemPoles[cursor.pole].blocks[cursor.block];
            Game.cursorSprites[i].drawRotated(ctx, block.x, block.y, cursor.selected ? Math.PI * 0.25 : 0);

            /*ctx.strokeStyle = TotemBlock.totemPoleColors[i];
            ctx.lineWidth = 6;
            canvasUtil.strokeCenteredRect(ctx, block.x, block.y, cursor.width, cursor.height);

            ctx.strokeStyle = '#fff';
            if (cursor.selected) {
                ctx.lineWidth = 4;
            } else {
                ctx.lineWidth = 2;
            }
            
            canvasUtil.strokeCenteredRect(ctx, block.x, block.y, cursor.width, cursor.height);*/
        }
    }
    
    for (i = 0; i < this.dynamicObjs.length; ++i) {
        this.dynamicObjs[i].render();
    }
    
    this.fg.drawRotated(ctx, ctx.canvas.width * 0.5, GROUND_LEVEL + this.fg.height * 0.2, 0, ctx.canvas.width / this.fg.width);

    ctx.font = '100px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(ctx.canvas.width * 0.5, ctx.canvas.height * 0.2);
    ctx.fillStyle = '#000';
    if (this.state === Game.START_COUNTDOWN) {
        var numTime = this.stateTime / START_COUNTDOWN_DURATION * 3;
        var currentNumberTime = mathUtil.fmod(numTime, 1.0);
        var num = 3 - Math.floor(numTime);
        var s = 1.6 - currentNumberTime * 0.6;
        ctx.scale(s, s);
        ctx.fillText(num, 0, 0);
    } else if (this.state === Game.PLAYING) {
        if (this.stateTime < 1) {
            var s = this.stateTime + 1;
            ctx.scale(s, s);
            ctx.globalAlpha = 1 - this.stateTime;
            ctx.fillText('PLAY!', 0, 0);
        }
    }
    ctx.restore();
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
    canvas = document.getElementById('totemGame');

    resizeGame();

    ctx = canvas.getContext('2d');

    //ctx.canvas.width = window.innerWidth;

    //ctx.canvas.height = window.innerHeight;

    game = new Game();
    
    nextFrameTime = new Date().getTime() - 1000 / FPS * 0.5;
    webFrame();
};

var resizeGame = function() {
    var gameArea = document.getElementById('gameArea');
    var widthToHeight = 4 / 3;
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;
    var newWidthToHeight = newWidth / newHeight;

    if (newWidthToHeight > widthToHeight) {
        newWidth = newHeight * widthToHeight;
        gameArea.style.height = newHeight + 'px';
        gameArea.style.width = newWidth + 'px';
    } else {
        newHeight = newWidth / widthToHeight;
        gameArea.style.width = newWidth + 'px';
        gameArea.style.height = newHeight + 'px';
    }

    gameArea.style.marginTop = (-newHeight / 2) + 'px';
    gameArea.style.marginLeft = (-newWidth / 2) + 'px';

    var gameCanvas = document.getElementById('totemGame');
    gameCanvas.width = newWidth;
    gameCanvas.height = newHeight;
};

window.addEventListener('resize', resizeGame, false);