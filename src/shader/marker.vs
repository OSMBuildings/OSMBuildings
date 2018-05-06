precision highp float; // is default in vertex shaders anyway, using highp fixes #49

attribute vec4 aPosition;
// uniform mat4 uMatrix;

uniform mat4 uProjMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {

//  mat4 modelMatrix = mat4(1.0); // creates an identity matrix

//  modelMatrix[3][0] = aPosition.x + uModelMatrix[3][0];
//  modelMatrix[3][1] = aPosition.y + uModelMatrix[3][0];
//  modelMatrix[3][2] = aPosition.z + uModelMatrix[3][0];

  mat4 modelView = uViewMatrix * uModelMatrix;

  modelView[0][0] = 1.0;
  modelView[0][1] = 0.0;
  modelView[0][2] = 0.0;

  modelView[1][0] = 0.0;
  modelView[1][1] = 1.0;
  modelView[1][2] = 0.0;

  modelView[2][0] = 0.0;
  modelView[2][1] = 0.0;
  modelView[2][2] = 1.0;

  gl_Position = uProjMatrix * modelView * aPosition;

  vTexCoord = aTexCoord;
}
