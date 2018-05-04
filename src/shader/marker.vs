precision highp float; // is default in vertex shaders anyway, using highp fixes #49

attribute vec4 aPosition;
// uniform mat4 uMatrix;

uniform mat4 uProjMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

void main() {
  mat4 modelView = uViewMatrix * uModelMatrix;

  // First col
  modelView[0][0] = 1.0;
  modelView[0][1] = 0.0;
  modelView[0][2] = 0.0;

  // Second col
  modelView[1][0] = 0.0;
  modelView[1][1] = 1.0;
  modelView[1][2] = 0.0;

  // Thrid col
  modelView[2][0] = 0.0;
  modelView[2][1] = 0.0;
  modelView[2][2] = 1.0;

  vec4 P = modelView * aPosition;
  gl_Position = uProjMatrix * P;

  // gl_Position = uMatrix * aPosition;
}
