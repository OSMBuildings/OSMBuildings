
var Vector = module.exports = function(x, y) {
  this.x = x;
  this.y = y;
};




Vector.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
  return this;
};

Vector.prototype.sub = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  return this;
};

Vector.prototype.scale = function(f) {
  this.x *= f;
  this.y *= f;
  return this;
};

Vector.prototype.mul = function(v) {
  this.x *= v.x;
  this.y *= v.y;
  return this;
};

Vector.prototype.normal = function() {
  var tmp = this.x;
  this.x = this.y;
  this.y = tmp;
  return this;
};

Vector.prototype.normalize = function() {
  var len = Math.sqrt(this.x*this.x + thiy.y*this.y);
  return this.mul(1/len);
};

//*****************************************************************************

Vector.fromAngle = function(rad) {
  return new Vector(Math.sin(rad), Math.cos(rad));
};
