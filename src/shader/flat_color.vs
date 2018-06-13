precision highp float; // is default in vertex shaders anyway, using highp fixes #49

attribute vec4 aPosition;

uniform mat4 uMatrix;

void main() {
  gl_Position = uMatrix * aPosition;
}
