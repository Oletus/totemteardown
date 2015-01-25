var FPS = 60;

var canvas;
var ctx;
var game;

var Game = function() {
    this.reset();
};

Game.prototype.reset = function() {
    this.totemPoles = [];
    this.dynamicObjs = [];

    this.stateTime = 0;
    this.state = Game.CHOOSE_PLAYERS;

    this.blockAppearInterval = BLOCK_APPEAR_INTERVAL;
    this.blockAppearTimer = this.blockAppearInterval - FIRST_BLOCK_APPEAR;
    this.appearPhase = 0;

    this.instructionsRequested = 0;
    
    var startPoleX = POLE_DISTANCE_FROM_EDGE,
        startPoleY = GROUND_LEVEL;

    for(var i = 0; i < POLE_COUNT; i++) {
        this.totemPoles.push(new TotemPole({x: startPoleX, y: startPoleY, color: i}));
        var startBlockY = startPoleY - (STARTING_BLOCKS + 1) * BLOCK_HEIGHT * 1.5;
        for (var j = 0; j < STARTING_BLOCKS; j++) {
            var types = STARTING_TYPES[i % STARTING_TYPES.length];
            var type = TotemBlock.typeFromChar(types[j % types.length]);
            this.totemPoles[i].blocks.push(new TotemBlock({x: startPoleX, y: startBlockY, type: type}));
            startBlockY += BLOCK_HEIGHT * 1.5;
        }
        this.totemPoles[i].blocks.push(new TotemBlock({x: startPoleX, y: startBlockY, type: TotemBlock.Type.INIT}));
        startPoleX += POLE_DISTANCE;
    }

    this.cursors = [];
    for (var i = 0; i < POLE_COUNT; ++i) {
        this.cursors.push(new Cursor({block: this.totemPoles[i].blocks.length - 1, pole: i}));
    }

    this.gamepads = new Gamepads(this);

    this.gamepads.addButtonChangeListener(Gamepads.BUTTONS.DOWN, this.moveCursorDown);
    this.gamepads.addButtonChangeListener(Gamepads.BUTTONS.UP, this.moveCursorUp);
    this.gamepads.addButtonChangeListener(Gamepads.BUTTONS.LEFT, this.cursorLeft);
    this.gamepads.addButtonChangeListener(Gamepads.BUTTONS.RIGHT, this.cursorRight);
    this.gamepads.addButtonChangeListener(Gamepads.BUTTONS.A, this.selectBlock, this.deselectBlock);
    this.gamepads.addButtonChangeListener(Gamepads.BUTTONS.X, this.activateBlock);
    this.gamepads.addButtonChangeListener(Gamepads.BUTTONS.START, this.start);
    this.gamepads.addButtonChangeListener(Gamepads.BUTTONS.Y, this.showInstructions, this.hideInstructions);
    addEventListener("keydown", this.debugMode, false);

    if(SOUND_ON) {
        Game.backgroundMusic.play();
    }
    
    this.winnersText = undefined;
    
    resizeGame();
};

Game.CHOOSE_PLAYERS = -2;
Game.PRE_COUNTDOWN = -1;
Game.START_COUNTDOWN = 0;
Game.PLAYING = 1;
Game.VICTORY = 2;

Game.cursorSprites = [
    new Sprite('cursor0.png'),
    new Sprite('cursor1.png'),
    new Sprite('cursor2.png'),
    new Sprite('cursor3.png')
];

Game.bg = new Sprite('BackgroundSky.png');
Game.fg = new Sprite('foreground.png');

Game.instructionsSprite = new Sprite('Instructions.png');

Game.backgroundMusic = new Audio('music', true);
Game.explosionSound = new Audio('explosion', false);
Game.shieldSound = new Audio('shield', false);
Game.thunderSound = new Audio('thunder', false);

Game.xSprite = new Sprite('button_x.png');

Game.prototype.showInstructions = function(playerNumber) {
    this.instructionsRequested += 1;
};

Game.prototype.hideInstructions = function(playerNumber) {
    this.instructionsRequested -= 1;
};

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
    return this.cursors[playerNumber];
};

Game.prototype.clampCursor = function(cursor) {
    if (cursor.pole >= this.totemPoles.length) {
        return;
    }
    var blocks = this.totemPoles[cursor.pole].blocks;
    if (cursor.block >= blocks.length) {
        cursor.block = blocks.length - 1;
    }
    if (cursor.block < 0) {
        cursor.block = 0;
    }
    while (blocks[cursor.block].state == TotemBlock.APPEARING && cursor.block > 0) {
        cursor.block--;
    }
    while (blocks[cursor.block].type == TotemBlock.Type.HEAD && cursor.block < blocks.length - 1) {
        cursor.block++;
    }
};

Game.prototype.clampAllCursors = function() {
    for (var i = 0; i < this.cursors.length; ++i) {
        this.clampCursor(this.cursors[i]);
    }
};

Game.prototype.getBlockTypeForPole = function(pole, types, tryIndex) {
    var decided = false;
    var leftWing = pole.blockCount(TotemBlock.Type.SHOOTLEFT);
    var rightWing = pole.blockCount(TotemBlock.Type.SHOOTRIGHT);
    while (!decided) {
        var type = TotemBlock.typeFromChar(types[tryIndex % types.length], leftWing - rightWing);
        decided = true;
        if (AVOID_CREATING_OVERREPRESENTED_BLOCKS) {
            if (pole.blocks.length > 0 && pole.blockCount(type) >= pole.blocks.length * 0.49) {
                decided = false;
            }
        }
        if (pole.blocks.length > 0 && pole.blocks[pole.blocks.length - 1].type == type) {
            decided = false;
        }
        ++tryIndex;
    }
    return type;
};

Game.prototype.spawnBlockInPole = function(i, tryIndex) {
    var pole = this.totemPoles[i];
    if (pole.blocks.length < VICTORY_BLOCKS) {
        var types = APPEAR_TYPES[i % APPEAR_TYPES.length];
        var type = this.getBlockTypeForPole(pole, types, tryIndex);
        var lastBlock = pole.blocks[pole.blocks.length - 1];
        pole.blocks.push(new TotemBlock({x: pole.x, y: lastBlock.y + BLOCK_HEIGHT, type: type, state: TotemBlock.APPEARING}));


        //game.emitters.push(new Emitter(new Vector(this.totemPoles[i].x, GROUND_LEVEL), Vector.fromAngle(4.7, 2), 1.8));
        //game.fields.push(new Field(new Vector(this.totemPoles[i].x, GROUND_LEVEL)), 1540);

        addNewParticles();
        plotParticles(canvas.width, canvas.height);
    }
};

Game.prototype.spawnNewBlocks = function() {
    for (var i = 0; i < this.totemPoles.length; ++i) {
        this.spawnBlockInPole(i, this.appearPhase);
    }

    this.winnersText = [];
    for (var i = 0; i < this.totemPoles.length; ++i) {
        var pole = this.totemPoles[i];
        var lastBlock = pole.blocks[pole.blocks.length - 1];
        if (pole.blocks.length >= VICTORY_BLOCKS && lastBlock.state == TotemBlock.APPEARING) {
            var lastBlock = pole.blocks[pole.blocks.length - 1];
            if (lastBlock.type !== TotemBlock.Type.THRUSTER) {
                pole.blocks.push(new TotemBlock({x: pole.x, y: lastBlock.y + BLOCK_HEIGHT, type: TotemBlock.Type.THRUSTER, state: TotemBlock.THRUSTING}));
            }
            this.winnersText.push('P' + (i + 1));
            if (this.state != Game.VICTORY) {
                this.state = Game.VICTORY;
                this.stateTime = 0;
            }
        }
    }
    if (this.state === Game.VICTORY) {
        this.winnersText = 'CONGRATS, ' + this.winnersText.join(', ') + '!';
    }

    Game.backgroundMusic.volume = 0.01;
    Game.thunderSound.volume = 0.3;

    if(SOUND_ON) {
        Game.thunderSound.playClone();
    }

    Game.backgroundMusic.volume = 1;

    ++this.appearPhase;
};

Game.prototype.start = function() {
    if (this.state === Game.VICTORY) {
        if (this.stateTime > MIN_VICTORY_TIME) {
            this.reset();
        }
        return;
    }
    var activePlayers = 0;
    for (var i = 0; i < this.totemPoles.length; ++i) {
        if (this.totemPoles[i].isInitialized()) {
            ++activePlayers;
        }
    }
    if (this.state == Game.CHOOSE_PLAYERS && activePlayers >= MIN_PLAYERS) {
        this.state = Game.PRE_COUNTDOWN;
        this.stateTime = 0;
        for (var i = 0; i < this.totemPoles.length;) {
            var pole = this.totemPoles[i];
            if (!pole.isInitialized()) {
                this.totemPoles.splice(i, 1);
            } else {
                ++i;
            }
        }
        resizeGame();
    }
};

Game.prototype.swap = function(pole, blockA, blockB) {
    var poleObj = this.totemPoles[pole];
    var a = poleObj.blocks[blockA];
    var b = poleObj.blocks[blockB];
    if (this.state == Game.PLAYING || (a.type == TotemBlock.Type.INIT || b.type == TotemBlock.Type.INIT)) {
        if (a.state == TotemBlock.SUPPORTED && b.state == TotemBlock.SUPPORTED &&
                a.type != TotemBlock.Type.HEAD && b.type != TotemBlock.Type.HEAD) {
            poleObj.blocks.splice(blockA, 1, b);
            poleObj.blocks.splice(blockB, 1, a);
            a.state = TotemBlock.SWAPPING;
            b.state = TotemBlock.SWAPPING;
            return true;
        }
        return false;
    } else {
        return false;
    }
};

Game.prototype.moveCursorDown = function(playerNumber) {
    var cursor = this.cursorActive(playerNumber);
    if(!cursor.selected) {
        if (this.state == Game.CHOOSE_PLAYERS) {
            return;
        }
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
        if (this.state == Game.CHOOSE_PLAYERS) {
            return;
        }
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
    return this.totemPoles.length > pole && this.totemPoles[pole].blocks.length > block;
};

Game.prototype.selectBlock = function(playerNumber) {
    if (this.state == Game.START_COUNTDOWN || this.state == Game.PRE_COUNTDOWN) {
        this.stateTime += 0.5;
        return;
    }
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
    if (this.state === Game.VICTORY) {
        if (this.stateTime > MIN_VICTORY_TIME) {
            this.reset();
        }
        return;
    }
    if (this.state == Game.START_COUNTDOWN || this.state == Game.PRE_COUNTDOWN) {
        this.stateTime += 0.5;
        return;
    }
    var cursor = this.cursorActive(playerNumber);
    if (this.hasBlock(cursor.pole, cursor.block)) {
        var pole = this.totemPoles[cursor.pole];
        if (pole.blocks[cursor.block].type == TotemBlock.Type.INIT) {
            if (cursor.block == 0) {
                pole.blocks.splice(0, 1);
                pole.addHead();
                this.clampAllCursors();
            }
        } else {
            if (this.state == Game.CHOOSE_PLAYERS) {
                return;
            }
            var addedObjs = pole.blocks[cursor.block].activate(playerNumber, this.eagleRoar);
            this.dynamicObjs.push.apply(this.dynamicObjs, addedObjs);
        }
    }
};

/**
 * @return {boolean} True if the projectile needs to be destroyed.
 */
Game.prototype.killBlocks = function(killBox) {
    if (this.state === Game.VICTORY) {
        return true;
    }
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

                if (block.type === TotemBlock.Type.HEAD) {
                    blocked = true;
                }

                if(blocked) {
                    if (block.hitpoints >= 0) {
                        block.hitpoints -= 1;
                        if (block.hitpoints <= 0) {
                            blocked = false;
                        }
                    }
                    if(blocked && SOUND_ON) {
                        Game.shieldSound.playClone();
                    }
                }

                if (!blocked) {

                    if(SOUND_ON) {
                        Game.explosionSound.playClone();
                    }

                    this.totemPoles[j].blocks.splice(k, 1);
                    this.clampAllCursors();
                }
                return true;
            }
        }
    }
    return false;
};

// This runs at fixed 60 FPS
Game.prototype.update = function() {
    var i;
    this.gamepads.update();

    this.stateTime += 1/FPS;
    if (this.state === Game.PRE_COUNTDOWN) {
        if (this.stateTime > PRE_COUNTDOWN_DURATION) {
            this.state = Game.START_COUNTDOWN;
            this.stateTime = 0;
        }
    }
    if (this.state === Game.START_COUNTDOWN) {
        if (this.stateTime > START_COUNTDOWN_DURATION) {
            this.state = Game.PLAYING;
            this.stateTime = 0;
        }
    }

    for(i = 0; i < this.totemPoles.length; i++) {
        var pole = this.totemPoles[i];
        var canShoot = (this.activeProjectiles(i) < MAX_ACTIVE_PROJECTILES_PER_PLAYER);
        pole.update(canShoot);
        while (pole.spawnBlocks > 0) {
            this.spawnBlockInPole(i, pole.spawnBlocks);
            pole.spawnBlocks--;
        }
    }

    var destroyedBox;

    for (i = 0; i < this.dynamicObjs.length; ++i) {
        var obj = this.dynamicObjs[i];
        obj.update();
        if (obj.dead) {
            this.dynamicObjs.splice(i, 1);
        } else {
            var killBox = obj.killBox();
            if (this.killBlocks(killBox)) {
                destroyedBox = killBox;
                var z = killBox.left + 50;
                var v;
                if(obj.velX > 0) {
                    v = z - 28;
                } else {
                    v = z - 75;
                }

                game.emitters.push(new Emitter(new Vector(v, obj.y), Vector.fromAngle(0, 2)));
                //game.fields.push(new Field(new Vector(obj.x - 25, obj.y)), 1540);
                //game.fields[0].position.x = obj.x - 25;
                //game.fields[0].position.x = obj.y - 10;
                this.dynamicObjs.splice(i, 1);
            }
        }
    }

    if (this.state == Game.PLAYING) {
        this.blockAppearTimer += 1/FPS;
        if (this.blockAppearInterval > 0 && this.blockAppearTimer > this.blockAppearInterval) {
            this.blockAppearTimer = 0;
            this.spawnNewBlocks();
            this.blockAppearInterval -= BLOCK_APPEAR_INTERVAL_REDUCE;
            if (this.blockAppearInterval < BLOCK_APPEAR_INTERVAL_MIN) {
                this.blockAppearInterval = BLOCK_APPEAR_INTERVAL_MIN;
            }
        }
    }

    //console.log(destroyedBox);

    addNewParticles();
    plotParticles(canvas.width, canvas.height);
};

Game.prototype.render = function() {
    var i;

    Game.bg.fillCanvas(ctx);

    var victoryLineHeight = GROUND_LEVEL - VICTORY_BLOCKS * BLOCK_HEIGHT;
    ctx.fillStyle = '#f80';
    ctx.fillRect(0, victoryLineHeight, ctx.canvas.width, 2);

    for (i = 0; i < this.totemPoles.length; i++) {
        this.totemPoles[i].render();
    }

    if (this.state !== Game.VICTORY) {
        for (i = 0; i < this.cursors.length; ++i) {
            var cursor = this.cursors[i];
            if (this.hasBlock(cursor.pole, cursor.block)) {
                var block = this.totemPoles[cursor.pole].blocks[cursor.block];
                Game.cursorSprites[i].drawRotated(ctx, block.x, block.y, cursor.selected ? Math.PI * 0.25 : 0);
                if (block.canBeActivated() && this.state === Game.PLAYING) {
                    if (block.type == TotemBlock.Type.SHOOTRIGHT) {
                        Game.xSprite.drawRotated(ctx, block.x + 65, block.y, 0);
                    } else {
                        Game.xSprite.drawRotated(ctx, block.x - 65, block.y, 0);
                    }
                };
            }
        }
    }
    
    for (i = 0; i < this.dynamicObjs.length; ++i) {
        this.dynamicObjs[i].render();
    }
    
    Game.fg.draw(ctx, 0, GROUND_LEVEL - Game.fg.height * 0.15);

    if(game.emitters.length > 0) {
        drawParticles();
    }

    this.drawHud();

    if(game.emitters.length > 0) {
        killEmitter(0);
    }
    
    if (this.instructionsRequested > 0 && this.state == Game.CHOOSE_PLAYERS) {
        Game.instructionsSprite.drawRotated(ctx, ctx.canvas.width * 0.5, ctx.canvas.height * 0.5, 0);
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
    canvas = document.getElementById('totemGame');

    resizeGame();

    ctx = canvas.getContext('2d');

    game = new Game();

    game.midX = ctx.canvas.width / 2;
    game.midY = ctx.canvas.height / 2;

    game.emitters = [];
    game.particles = [];
    game.fields = [new Field(new Vector(), 1540)];

    nextFrameTime = new Date().getTime() - 1000 / FPS * 0.5;
    webFrame();
};

var resizeGame = function() {
    var gameArea = document.getElementById('gameArea');
    var poles = POLE_COUNT;
    if (game && game.totemPoles.length > 0) {
        poles = game.totemPoles.length;
    }
    screenWidthForPlayerCount = (poles - 1) * POLE_DISTANCE + 2 * POLE_DISTANCE_FROM_EDGE;
    var widthToHeight = screenWidthForPlayerCount / SCREEN_HEIGHT;
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
    gameCanvas.width = screenWidthForPlayerCount;
    gameCanvas.height = SCREEN_HEIGHT;
};

window.addEventListener('resize', resizeGame, false);

var addNewParticles = function() {
    if (game.particles.length > MAX_PARTICLES) return;

    for (var i = 0; i < game.emitters.length; i++) {
        for (var j = 0; j < EMISSION_RATE; j++) {
            game.particles.push(game.emitters[i].emitParticle());
        }
    }
};

var plotParticles = function(boundsX, boundsY) {
    var currentParticles = [];

    for (var i = 0; i < game.particles.length; i++) {
        var particle = game.particles[i];
        var pos = particle.position;

        if (pos.x < 0 || pos.x > boundsX || pos.y < 0 || pos.y > boundsY) continue;

        particle.move();

        currentParticles.push(particle);
    }

    //game.particles = currentParticles;
};

var drawParticles = function() {

    ctx.fillStyle = 'rgb(255,255,255)';
    for (var i = 0; i < game.particles.length; i++) {
        var position = game.particles[i].position;
        ctx.fillRect(position.x, position.y, PARTICLE_SIZE, PARTICLE_SIZE);
    }
};

var killEmitter = function() {
    setTimeout(function() {
        game.emitters = [];
        game.particles = [];
        game.fields = [];

    }, 1000);
};
