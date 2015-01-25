function Particle(point, velocity, acceleration) {
    this.position = point || new Vector(0, 0);
    this.velocity = velocity || new Vector(0, 0);
    this.acceleration = acceleration || new Vector(0, 0);
}

Particle.prototype.move = function () {
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
