precision highp float;  //is default in vertex shaders anyway, using highp fixes #49

#define halfPi 1.57079632679

attribute vec4 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uMatrix;
uniform float uAbsoluteHeight;

varying vec2 vTexCoord;
varying float vRelativeHeight;

const float gradientHeight = 10.0;
const float gradientStrength = 1.0;


void main() {
  gl_Position = uMatrix * aPosition;
  vTexCoord = aTexCoord;
  vRelativeHeight = aPosition.z / uAbsoluteHeight;
}
