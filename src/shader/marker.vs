precision highp float; // is default in vertex shaders anyway, using highp fixes #49

#define halfPi 1.57079632679

attribute vec4 aPosition;
uniform mat4 uViewMatrix;

void main() {
  gl_Position = uViewMatrix * aPosition;

}