var TotemBlock = function(options) {
    var defaults = {
        x: 0,
        y: 0,
        width: 50,
        height: BLOCK_HEIGHT,
        type: 0,
        state: TotemBlock.SUPPORTED,
        velY: 0,
        facingLeft: false
    };

    for(var key in defaults) {
        if(!options.hasOwnProperty(key)) {
            this[key] = defaults[key];
        } else {
            this[key] = options[key];
        }
    }
};

TotemBlock.SUPPORTED = 0;
TotemBlock.SWAPPING = 1;
TotemBlock.FALLING = 2;
TotemBlock.APPEARING = 3;

TotemBlock.Type = {
    SHOOTLEFT: 0,
    SHOOTRIGHT: 1,
    SHIELD: 2,
    JUMP: 3,
    EMPTY: 4,
    STATIC: 5 // used for something like the totem head, that's not interactive
};

TotemBlock.typeFromChar = function(char) {
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
        } else if (this.y > supportedLevel) {
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
        }
    }
    
};

TotemBlock.prototype.render = function(color) {
    ctx.fillStyle = color;
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
    ctx.fill();
    //ctx.fillText(this.state, this.x - 15, this.y - 12);
};

/**
 * @return {Array} array of created objects
 */
TotemBlock.prototype.activate = function(playerNumber) {
    if (this.type === TotemBlock.Type.SHIELD) {
        this.facingLeft = !this.facingLeft;
    }
    if (this.type === TotemBlock.Type.JUMP) {
        if (this.state == TotemBlock.SUPPORTED) {
            this.state = TotemBlock.FALLING;
            this.velY -= JUMP_SPEED;
        }
    }
    if (this.type === TotemBlock.Type.SHOOTLEFT) {
        return [new Projectile({x: this.x - this.width * 0.5 - 10, y: this.y, velX: -SHOT_SPEED, shooter: playerNumber})];
    }
    if (this.type === TotemBlock.Type.SHOOTRIGHT) {
        return [new Projectile({x: this.x + this.width * 0.5 + 10, y: this.y, velX: SHOT_SPEED, shooter: playerNumber})];
    }
    return [];
};

TotemBlock.prototype.hitBox = function() {
    return new Rect(this.x - this.width * 0.5, this.x + this.width * 0.5, this.y - this.height * 0.5, this.y + this.height * 0.5);
};
