
var Vector = require('./Vector.js');

var Segment = module.exports = function(a, b) {
  this.a = a;
  this.b = b;
};

Segment.prototype.getLength = function() {
  return this.a.distanceTo(this.b);
};

Segment.prototype.getCenter = function() {
  var dx = this.a.x-this.b.x, dy = this.a.y-this.b.y;
  return new Vector(this.a.x+dx/2, this.a.y+dy/2);
};

Segment.prototype.distanceTo = function(v) {
  var dx = this.x-v.x, dy = this.y-v.y;
  return Math.sqrt(dx*dx + dy*dy);
};
