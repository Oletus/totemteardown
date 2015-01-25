var Particle = function(point, velocity, acceleration) {
    this.position = point || new Vector(0, 0);
    this.velocity = velocity || new Vector(0, 0);
    this.acceleration = acceleration || new Vector(1, 1);
};

Particle.prototype.move = function() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
};
