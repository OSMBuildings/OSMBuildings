#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec3 aNormal;

uniform mat4 uMatrix;

varying vec3 vNormal;

void main() {

  gl_Position = uMatrix * aPosition;
  vNormal = aNormal;
}
