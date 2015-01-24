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

TotemBlock.Type = {
    SHOOTLEFT: 0,
    SHOOTRIGHT: 1,
    BLOCK: 2,
    JUMP: 3,
    EMPTY: 4,
    STATIC: 5 // used for something like the totem head, that's not interactive
};

TotemBlock.SEED = 0;

TotemBlock.randomType = function() {
    TotemBlock.SEED = (TotemBlock.SEED + 1) % 5;
    return TotemBlock.SEED;
    //return Math.floor(Math.random() * (5 - 0.00001)); // types 0 to 4
};

TotemBlock.prototype.update = function(supportedLevel) {
    if (this.state == TotemBlock.SWAPPING) {
        if (this.y < supportedLevel) {
            this.y += SWAP_SPEED;
            if (this.y > supportedLevel) {
                this.state = TotemBlock.SUPPORTED;
                this.y = supportedLevel;
            }
        } else if (this.y > supportedLevel) {
            this.y -= SWAP_SPEED;
            if (this.y < supportedLevel) {
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
        if (this.y > supportedLevel - 0.5) {
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
    ctx.lineWidth = 5;
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
    if (this.type === TotemBlock.Type.BLOCK) {
        ctx.save();
        if (this.facingLeft) {
            ctx.translate(-10, 0);
        } else {
            ctx.translate(10, 0);
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
    //ctx.fillText(this.type, this.x, this.y);
};
