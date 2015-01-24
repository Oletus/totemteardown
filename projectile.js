var Projectile = function(options) {
    var defaults = {
        x: 0,
        y: 0,
        velX: 0,
        shooter: 0
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
};

Projectile.prototype.render = function() {
    ctx.fillStyle = 'white';
    canvasUtil.fillCenteredRect(ctx, this.x, this.y, 10, 10);
};

Projectile.prototype.killBox = function() {
    return new Rect(this.x - 5, this.x + 5, this.y - 5, this.y + 5);
};