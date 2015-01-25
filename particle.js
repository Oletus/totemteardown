function Particle(point, velocity, acceleration) {
    this.position = point || new Vector(0, 0);
    this.velocity = velocity || new Vector(0, 0);
    this.acceleration = acceleration || new Vector(0, 0);
    this.lifetime = Math.random() * 0.5 + 0.3;
    this.timeAlive = 0;
    this.dead = false;
}

Particle.prototype.move = function () {
    this.timeAlive += 1/FPS;
    if (this.timeAlive > this.lifetime) {
        this.dead = true;
    }
    var vectorX = this.position.x;
    var vectorY = this.position.y;
    var totalAccelerationX = 0;
    var totalAccelerationY = 0;


    var force = 1000 / Math.pow(vectorX * vectorX + vectorY * vectorY, 1.5);

    totalAccelerationX += vectorX * force;
    totalAccelerationY += vectorY * force;

    // update our particle's acceleration
    this.acceleration = new Vector(totalAccelerationX, totalAccelerationY);
    this.acceleration.y = ((this.acceleration.y * GRAVITY) * 8);

    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
};

Particle.prototype.scale = function() {
    return 1.0 - this.timeAlive / this.lifetime;
};
