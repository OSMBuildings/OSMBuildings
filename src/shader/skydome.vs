precision highp float;  //is default in vertex shaders anyway, using highp fixes #49

#define halfPi 1.57079632679

attribute vec4 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform mat4 uMatrix;

varying vec2 vTexCoord;
varying float vRelativeHeight;

float gradientHeight = 10.0;
float gradientStrength = 1.0;

uniform float uBendRadius;
uniform float uBendDistance;
uniform float uAbsoluteHeight;

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
//  gl_Position = uProjMatrix * newPosition;

  gl_Position = uMatrix * aPosition;

  vTexCoord = aTexCoord;
  vRelativeHeight = aPosition.z / uAbsoluteHeight;
}
