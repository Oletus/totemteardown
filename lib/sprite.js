var Sprite = function(filename) {
    this.filename = filename;
    this.img = document.createElement('img');
    if (typeof this.filename != typeof '') {
        this.img = this.filename;
        this.loaded = true;
        this.width = this.filename.width;
        this.height = this.filename.height;
    } else {
        this.img.src = 'gfx/' + filename;
        var that = this;
        this.loaded = false;
        this.img.onload = function() {
            that.loaded = true;
            that.width = that.img.width;
            that.height = that.img.height;
        };
    }
};

Sprite.prototype.draw = function(ctx, x, y) {
    if (this.loaded) {
        ctx.drawImage(this.img, x, y);
    }
};

Sprite.prototype.drawRotated = function(ctx, centerX, centerY, angleRadians, /* optional */ scale) {
    if (!this.loaded) {
        return;
    }
    if (angleRadians === undefined) {
        angleRadians = 0.0;
    }
    if (scale === undefined) {
        scale = 1.0;
    }
    if (this.loaded) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angleRadians);
        ctx.scale(scale, scale);
        ctx.translate(-this.width * 0.5, -this.height * 0.5);
        ctx.drawImage(this.img, 0, 0);
        ctx.restore();
    }
};

Sprite.prototype.drawRotatedNonUniform = function(ctx, centerX, centerY, angleRadians, scaleX, scaleY) {
    if (!this.loaded) {
        return;
    }
    if (angleRadians === undefined) {
        angleRadians = 0.0;
    }
    if (scaleX === undefined) {
        scale = 1.0;
    }
    if (scaleY === undefined) {
        scale = 1.0;
    }
    if (this.loaded) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angleRadians);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-this.width * 0.5, -this.height * 0.5);
        ctx.drawImage(this.img, 0, 0);
        ctx.restore();
    }
};

Sprite.prototype.fillCanvas = function(ctx) {
    if (!this.loaded) {
        return;
    }
    var scale = Math.max(ctx.canvas.width / this.width, ctx.canvas.height / this.height);
    this.drawRotated(ctx, ctx.canvas.width * 0.5, ctx.canvas.height * 0.5, 0, scale);
};

Sprite.prototype.fillCanvasFitBottom = function(ctx) {
    if (!this.loaded) {
        return;
    }
    var scale = Math.max(ctx.canvas.width / this.width, ctx.canvas.height / this.height);
    this.drawRotated(ctx, ctx.canvas.width * 0.5, ctx.canvas.height - scale * this.height * 0.5, 0, scale);
};
