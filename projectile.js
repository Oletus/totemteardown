var Projectile = function(options) {
    var defaults = {
        x: 0,
        y: 0,
        velX: 0,
        shooter: 0,
        travelled: 0,
        dead: false
    };

    for(var key in defaults) {
        if(!options.hasOwnProperty(key)) {
            this[key] = defaults[key];
        } else {
            this[key] = options[key];
        }
    }
};

Projectile.prototype.update = function() {
    this.x += this.velX;
    if (this.x < 0) {
        this.x = ctx.canvas.width;
    }
    if (this.x > ctx.canvas.width) {
        this.x = 0;
    }
    this.travelled += Math.abs(this.velX);
    if (this.travelled > ctx.canvas.width * 1.5) {
        this.dead = true;
    }
};

Projectile.prototype.render = function() {
    ctx.fillStyle = 'white';
    canvasUtil.fillCenteredRect(ctx, this.x, this.y, 10, 10);
};

Projectile.prototype.killBox = function() {
    return new Rect(this.x - 5, this.x + 5, this.y - 5, this.y + 5);
};