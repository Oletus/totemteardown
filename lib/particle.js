var ParticleSystem = function(groundY, splashCallbackTarget) {
    this.particles = [];
    this.groundY = groundY;
    this.splashCallbackTarget = splashCallbackTarget;
};

ParticleSystem.prototype.update = function(deltaTMillis) {
    var i = 0;
    while (i < this.particles.length) {
        var part = this.particles[i];
        part.update(deltaTMillis);
        if (part.dead || (part.createsSplash && part.pos.y > this.groundY + part.groundVar)) {
            if (part.createsSplash) {
                this.splash(part);
                this.splashCallbackTarget.splashCallback(part.pos.x, this.groundY + part.groundVar);
            }
            this.particles.splice(i, 1);
        } else {
            ++i;
        }
    }
};

ParticleSystem.prototype.draw = function(ctx) {
    for (var i = 0; i < this.particles.length; ++i) {
        this.particles[i].draw(ctx);
    }
};

ParticleSystem.prototype.splash = function(part) {
    for (var i = 0; i < part.splashCount; ++i) {
        var newPos = new Vec2();
        newPos.setVec2(part.pos);
        var angle = part.splashAngle + (Math.random() - 0.5) * part.splashAngleVariation;
        var randomVel = new Vec2(Math.cos(angle), Math.sin(angle));
        randomVel.scale(part.splashVel + (Math.random() - 0.5) * part.splashVelVariation);
        randomVel.y *= part.splashVelYMult;
        this.particles.push(new Particle(newPos, randomVel, part.acc, part.size * 0.3, part.color, part.initLifeSeconds, false));
    }
};

var Particle = function(pos, vel, acc, size, color, lifeSeconds,
                        createsSplash, splashCount,
                        splashAngle, splashAngleVariation,
                        splashVel, splashVelVariation,
                        splashVelYMult) {
    this.pos = pos;
    this.vel = vel;
    this.acc = acc;
    this.size = size;
    this.color = color;
    this.initLifeSeconds = lifeSeconds;
    this.lifeSeconds = lifeSeconds;
    if (createsSplash === undefined) {
        createsSplash = false;
    }
    this.createsSplash = createsSplash;
    this.splashCount = splashCount;
    this.splashAngle = splashAngle;
    this.splashAngleVariation = splashAngleVariation;
    this.splashVel = splashVel;
    this.splashVelVariation = splashVelVariation;
    this.splashVelYMult = splashVelYMult;
    this.groundVar = 0;
};

Particle.prototype.update = function(deltaTMillis) {
    var accFrame = new Vec2();
    accFrame.setVec2(this.acc);
    accFrame.scale(deltaTMillis / 1000);
    this.vel.translate(accFrame);
    var velFrame = new Vec2();
    velFrame.setVec2(this.vel);
    velFrame.scale(deltaTMillis / 1000);
    this.pos.translate(velFrame);
    this.lifeSeconds -= deltaTMillis * 0.001;
    this.dead = this.lifeSeconds < 0;
};

Particle.prototype.draw = function(ctx) {
    var size = this.size;
    if (!this.createsSplash) {
        size *= this.lifeSeconds / this.initLifeSeconds;
    }
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, size, size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
};