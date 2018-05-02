precision highp float; // is default in vertex shaders anyway, using highp fixes #49

#define halfPi 1.57079632679

attribute vec4 aPosition;

uniform mat4 uMatrix;
uniform float uAbsoluteHeight;

varying vec2 vTexCoord;
varying float vRelativeHeight;

void main() {
  gl_Position = uMatrix * aPosition;
  vRelativeHeight = aPosition.z / uAbsoluteHeight;
}
