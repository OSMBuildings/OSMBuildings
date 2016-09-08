
function HippedRoof(properties, geometry, center) {
  var outerRing = RidgedRoof(properties, geometry[0], center, 1/3);
  return [outerRing];
}

// HippedRoof.prototype.getInnerSegments = function() {
//   return [
//     this.ridge,
//     [this.ridge[0], this.cap1[0]],
//     [this.ridge[0], this.cap1[1]],
//     [this.ridge[1], this.cap2[0]],
//     [this.ridge[1], this.cap2[1]]
//   ];
// };

// TODO: handle ridge vs. height coords