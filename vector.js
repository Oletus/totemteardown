var Vector = function(x, y) {
    this.x = x;
    this.y = y;
};

Vector.prototype.add = function(vector) {
    this.x += vector.x;
    this.y += vector.y;
};

Vector.prototype.magnitude = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.angle = function() {
    return Math.atan2(this.x, this.y);
};

Vector.fromAngle = function(angle, magnitude) {
    return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};
