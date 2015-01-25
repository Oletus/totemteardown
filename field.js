function Field(point, mass) {
    this.position = point;
    this.setMass(mass);
}

Field.prototype.setMass = function(mass) {
    this.mass = mass || 1500;
    this.drawColor = mass < 0 ? "#f00" : "#0f0";
}
