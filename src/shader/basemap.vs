#ifdef GL_ES
  precision mediump float;
#endif

#define halfPi 1.57079632679

attribute vec4 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform mat4 uMatrix;
uniform vec2 uViewDirOnMap;
uniform vec2 uLowerEdgePoint;

varying vec2 vTexCoord;
varying float verticalDistanceToLowerEdge;

uniform float uBendRadius;
uniform float uBendDistance;

void main() {

  //*** bending ***************************************************************

//  vec4 mwPosition = uViewMatrix * uModelMatrix * aPosition;
//
//  float innerRadius = uBendRadius + mwPosition.y;
//  float depth = abs(mwPosition.z);
//  float s = depth-uBendDistance;
//  float theta = min(max(s, 0.0)/uBendRadius, halfPi);
//
//  // halfPi*uBendRadius, not halfPi*innerRadius, because the "base" of a building
//  // travels the full uBendRadius path
//  float newY = cos(theta)*innerRadius - uBendRadius - max(s-halfPi*uBendRadius, 0.0);
//  float newZ = normalize(mwPosition.z) * (min(depth, uBendDistance) + sin(theta)*innerRadius);
//
//  vec4 newPosition = vec4(mwPosition.x, newY, newZ, 1.0);
//  vec4 glPosition = uProjMatrix * newPosition;

  gl_Position = uMatrix * aPosition;
  vTexCoord = aTexCoord;

  vec4 worldPos = uModelMatrix * aPosition;
  vec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;
  verticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);
}
