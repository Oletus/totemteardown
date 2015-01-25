var TotemBlock = function(options) {
    var defaults = {
        x: 0,
        y: 0,
        width: 50,
        height: BLOCK_HEIGHT,
        type: 0,
        state: TotemBlock.SUPPORTED,
        velY: 0,
        facingLeft: false,
        hitpoints: SHIELD_HITPOINTS,
        timeExisted: 0,
        sinceActivation: 10,
        canShoot: true
    };

    for(var key in defaults) {
        if(!options.hasOwnProperty(key)) {
            this[key] = defaults[key];
        } else {
            this[key] = options[key];
        }
    }

    this.woodSound = new Audio('wood', false);
    this.eagleRoar = new Audio('eagle', false);
    this.swooshSound = new Audio('swoosh', false);
};

TotemBlock.SUPPORTED = 0;
TotemBlock.SWAPPING = 1;
TotemBlock.FALLING = 2;
TotemBlock.APPEARING = 3;
TotemBlock.THRUSTING = 4;

TotemBlock.Type = {
    SHOOTLEFT: 0,
    SHOOTRIGHT: 1,
    SHIELD: 2,
    JUMP: 3,
    EMPTY: 4,
    INIT: 5,
    THRUSTER: 6,
    HEAD: 7
};

TotemBlock.spriteSrc = [
    new Sprite('block_shoot_left.png'),
    new Sprite('block_shoot_right.png'),
    new Sprite('block-shield.png'),
    new Sprite('block-jump.png'),
    new Sprite('block-empty.png'),
    new Sprite('block-init.png'),
    new Sprite('block-thruster.png'),
    new Sprite('block_shoot_left_charge.png'),
    new Sprite('block_shoot_right_charge.png'),
    new Sprite('block_shoot_left_shoot.png'),
    new Sprite('block_shoot_right_shoot.png')
];

TotemBlock.headSprites = [
    new Sprite('head0.png'),
    new Sprite('head1.png'),
    new Sprite('head2.png'),
    new Sprite('head3.png')
];

TotemBlock.hitSprites = [
    new Sprite('block-shield-broken-1.png'),
    new Sprite('block-shield-broken-2.png')
];

TotemBlock.sprites = null;

TotemBlock.whiteSprites = null;

TotemBlock.whiteHeadSprites = null;

TotemBlock.totemPoleColors = ['red', 'blue', 'green', 'yellow'];

var loadSprites = function() {
    for (var i = 0; i < TotemBlock.spriteSrc.length; ++i) {
        var src = TotemBlock.spriteSrc[i];
        if (!src.loaded) {
            setTimeout(loadSprites, 500);
            return;
        }
    }
    for (var i = 0; i < TotemBlock.headSprites.length; ++i) {
        var src = TotemBlock.headSprites[i];
        if (!src.loaded) {
            setTimeout(loadSprites, 500);
            return;
        }
    }
    TotemBlock.sprites = [];
    TotemBlock.whiteSprites = [];
    TotemBlock.whiteHeadSprites = [];
    for (var i = 0; i < TotemBlock.spriteSrc.length; ++i) {
        var src = TotemBlock.spriteSrc[i];
        var tintedVariations = [];
        for (var j = 0; j < 4; ++j) {
            if (TINTING_AMOUNT > 0) {
                var solid = src.getSolidColoredVersion(TotemBlock.totemPoleColors[j]);

                var canvas3 = document.createElement('canvas');
                canvas3.width = src.width;
                canvas3.height = src.height;
                var ctx3 = canvas3.getContext('2d');
                TotemBlock.spriteSrc[i].draw(ctx3, 0, 0);
                ctx3.globalAlpha = TINTING_AMOUNT;
                solid.draw(ctx3, 0, 0);
                tintedVariations.push(new Sprite(canvas3));
            } else {
                tintedVariations.push(src);
            }
        }
        TotemBlock.sprites.push(tintedVariations);
        var white = src.getSolidColoredVersion('#fff');
        TotemBlock.whiteSprites.push(white);
    }

    for (var i = 0; i < TotemBlock.headSprites.length; ++i) {
        var src = TotemBlock.headSprites[i];
        var white = src.getSolidColoredVersion('#fff');
        TotemBlock.whiteHeadSprites.push(white);
    }
};

loadSprites();

TotemBlock.typeFromChar = function(char, leftWingAdvantage) {
    if (char == 'L') {
        return TotemBlock.Type.SHOOTLEFT;
    }
    if (char == 'R') {
        return TotemBlock.Type.SHOOTRIGHT;
    }
    if (char == 'B') {
        return TotemBlock.Type.SHIELD;
    }
    if (char == 'E') {
        return TotemBlock.Type.EMPTY;
    }
    if (char == 'J') {
        return TotemBlock.Type.JUMP;
    }
    if (char == 'S') {
        if (leftWingAdvantage > 0) {
            return TotemBlock.Type.SHOOTRIGHT;
        }
        if (leftWingAdvantage < 0) {
            return TotemBlock.Type.SHOOTLEFT;
        }
        return Math.random() > 0.5 ? TotemBlock.Type.SHOOTLEFT : TotemBlock.Type.SHOOTRIGHT;
    }
};

TotemBlock.SEED = 0;

TotemBlock.randomType = function() {
    TotemBlock.SEED = (TotemBlock.SEED + 1) % 5;
    return TotemBlock.SEED;
    //return Math.floor(Math.random() * (5 - 0.00001)); // types 0 to 4
};

TotemBlock.prototype.update = function(supportedLevel) {
    this.timeExisted += 1/FPS;
    this.sinceActivation += 1/FPS;
    if (this.state == TotemBlock.APPEARING) {
        if (this.y > supportedLevel) {
            this.y -= SWAP_SPEED * 0.5;
            if (this.y <= supportedLevel) {
                this.y = supportedLevel;
                this.state = TotemBlock.SUPPORTED;
            }
        }
    } else if (this.state == TotemBlock.SWAPPING) {
        if (this.y < supportedLevel) {
            this.y += SWAP_SPEED;
            if (this.y >= supportedLevel) {
                this.state = TotemBlock.SUPPORTED;
                this.y = supportedLevel;
            }
        } else {
            this.y -= SWAP_SPEED;
            if (this.y <= supportedLevel) {
                this.state = TotemBlock.SUPPORTED;
                this.y = supportedLevel;
            }
        }
    } else if (this.state == TotemBlock.SUPPORTED) {
        if (this.y < supportedLevel - FALL_SPEED - 0.1) {
            this.state = TotemBlock.FALLING;
        } else if (this.y < supportedLevel) {
            this.y = supportedLevel;
        } else if (this.y > supportedLevel) {
            this.y = supportedLevel;
        }
    } else if (this.state == TotemBlock.THRUSTING) {
        this.velY -= FALL_ACCELERATION;
        this.y += this.velY;
        if (this.y < -100) {
            this.y = -100;
        }
    }
    
    if (this.state == TotemBlock.FALLING) {
        this.y += this.velY;
        this.velY += FALL_ACCELERATION;
        if (this.velY > FALL_SPEED) {
            this.velY = FALL_SPEED;
        }
        if ((this.velY > 0 && this.y > supportedLevel - 0.5) || this.y > supportedLevel) {
            this.y = supportedLevel;
            this.state = TotemBlock.SUPPORTED;
            this.velY = 0;

            if(SOUND_ON) {
                this.woodSound.play();
            }
        }
    }
    
};

TotemBlock.prototype.render = function(color) {
    if (TotemBlock.sprites !== null) {
        var mainSprite, whiteSprite, yOffset = 0;
        if (this.type == TotemBlock.Type.HEAD) {
            mainSprite = TotemBlock.headSprites[color];
            whiteSprite = TotemBlock.whiteHeadSprites[color];
            var yOffset = -50;
        } else {
            var type = this.type;
            if (this.type === TotemBlock.Type.SHOOTLEFT || this.type === TotemBlock.Type.SHOOTRIGHT) {
                if (this.sinceActivation < 0.5) {
                    type += 9;
                } else if (this.canShoot) {
                    type += 7;
                }
            }
            mainSprite = TotemBlock.sprites[type][color];
            whiteSprite = TotemBlock.whiteSprites[type];
        }
        
        mainSprite.drawRotated(ctx, this.x, this.y + yOffset, 0);
        if (this.timeExisted < 1) {
            ctx.globalAlpha = 1 - this.timeExisted;
            whiteSprite.drawRotated(ctx, this.x, this.y + yOffset, 0);
            ctx.globalAlpha = 1;
        }

        if (this.type == TotemBlock.Type.SHIELD) {
            if (this.hitpoints == 2) {
                TotemBlock.hitSprites[0].drawRotated(ctx, this.x, this.y, 0);
            } else if (this.hitpoints == 1) {
                TotemBlock.hitSprites[1].drawRotated(ctx, this.x, this.y, 0);
            }
        }
    }
    // Commented: debug draw mode
    /*ctx.fillStyle = color;
    canvasUtil.fillCenteredRect(ctx, this.x, this.y, this.width, this.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    canvasUtil.strokeCenteredRect(ctx, this.x, this.y, this.width, this.height);
    ctx.fillStyle = 'black';
    
    ctx.beginPath();
    if (this.type === TotemBlock.Type.SHOOTLEFT) {
        ctx.moveTo(this.x - 10, this.y - 10);
        ctx.lineTo(this.x - 10, this.y + 10);
        ctx.lineTo(this.x - 20, this.y);
        ctx.lineTo(this.x - 10, this.y - 10);
    }
    if (this.type === TotemBlock.Type.SHOOTRIGHT) {
        ctx.moveTo(this.x + 10, this.y - 10);
        ctx.lineTo(this.x + 10, this.y + 10);
        ctx.lineTo(this.x + 20, this.y);
        ctx.lineTo(this.x + 10, this.y - 10);
    }
    if (this.type === TotemBlock.Type.SHIELD) {
        ctx.save();
        if (!BLOCK_BOTH_DIRECTIONS) {
            if (this.facingLeft) {
                ctx.translate(-10, 0);
            } else {
                ctx.translate(10, 0);
            }
        }
        ctx.moveTo(this.x + 10, this.y - 10);
        ctx.lineTo(this.x + 10, this.y + 10);
        ctx.lineTo(this.x - 10, this.y + 10);
        ctx.lineTo(this.x - 10, this.y - 10);
        ctx.lineTo(this.x + 10, this.y - 10);
        ctx.restore();
    }
    if (this.type === TotemBlock.Type.JUMP) {
        ctx.moveTo(this.x + 10, this.y + 15);
        ctx.lineTo(this.x + 10, this.y + 10);
        ctx.lineTo(this.x - 10, this.y + 10);
        ctx.lineTo(this.x - 10, this.y + 15);
        ctx.lineTo(this.x + 10, this.y + 15);
    }
    ctx.fill();*/
    //ctx.fillText(this.state, this.x - 15, this.y - 12);
};

/**
 * @return {Array} array of created objects
 */
TotemBlock.prototype.activate = function(playerNumber) {
    if ((this.type === TotemBlock.Type.SHOOTLEFT || this.type === TotemBlock.Type.SHOOTRIGHT) && !this.canShoot) {
        return [];
    }
    this.sinceActivation = 0;
    if (this.type === TotemBlock.Type.SHIELD) {
        this.facingLeft = !this.facingLeft;
    }
    if (this.type === TotemBlock.Type.JUMP) {
        if (this.state == TotemBlock.SUPPORTED) {
            this.state = TotemBlock.FALLING;
            this.velY -= JUMP_SPEED;
        }
        if(SOUND_ON) {
            this.swooshSound.play();
        }
    }
    if (this.type === TotemBlock.Type.SHOOTLEFT) {
        if(SOUND_ON) {
            this.eagleRoar.play();
        }
        return [new Projectile({x: this.x - this.width * 0.5 - 10, y: this.y, velX: -SHOT_SPEED, shooter: playerNumber})];
    }
    if (this.type === TotemBlock.Type.SHOOTRIGHT) {
        if(SOUND_ON) {
            this.eagleRoar.play();
        }
        return [new Projectile({x: this.x + this.width * 0.5 + 10, y: this.y, velX: SHOT_SPEED, shooter: playerNumber})];
    }
    return [];
};

TotemBlock.prototype.hitBox = function() {
    return new Rect(this.x - this.width * 0.5, this.x + this.width * 0.5, this.y - this.height * 0.5, this.y + this.height * 0.5);
};
