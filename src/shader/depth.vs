#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;

uniform mat4 uMatrix;
varying vec4 vPosition;

void main() {

  gl_Position = uMatrix * aPosition;
  vPosition = uMatrix * aPosition;
}
