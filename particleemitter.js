var ParticleEmitter = function(point, velocity, spread, rate, ctx) {
    this.position = point;
    this.velocity = velocity;
    this.spread = spread || Math.PI / 32;
    this.maxParticles = 10000;
    this.particles = [];
    this.particleSize = 1;
    this.ctx = ctx;
};

ParticleEmitter.prototype.emitParticle = function() {
    var angle = this.velocity.angle() + this.spread - (Math.random() * this.spread * 2),
        magnitude = this.velocity.magnitude(),
        position = new Vector(this.position.x, this.position.y),
        velocity = Vector.fromAngle(angle, magnitude);

    return new Particle(position, velocity);
};

ParticleEmitter.prototype.addNewParticles = function() {
    if (this.particles.length > this.maxParticles) {
        return;
    }

    for (var i = 0; i < this.maxParticles; i++) {
        this.particles.push(this.emitParticle());
    }

    console.log(this.particles);
};

ParticleEmitter.prototype.plotParticles = function(boundsX, boundsY) {

    var currentParticles = [];

    for (var i = 0; i < this.particles.length; i++) {
        var particle = this.particles[i];
        var pos = particle.position;

        if (pos.x < 0 || pos.x > boundsX || pos.y < 0 || pos.y > boundsY) continue;

        particle.move();

        console.log(currentParticles);

        currentParticles.push(particle);
    }

    this.particles = currentParticles;
};

ParticleEmitter.prototype.update = function(x, y) {
    this.addNewParticles();
    this.plotParticles(x, y);
};

ParticleEmitter.prototype.drawParticles = function() {

    this.ctx.fillStyle = 'rgb(0,0,255)';

    // For each particle
    for (var i = 0; i < this.particles.length; i++) {
        var position = this.particles[i].position;

        this.ctx.fillRect(position.x, position.y, this.particleSize, this.particleSize);
    }
}
