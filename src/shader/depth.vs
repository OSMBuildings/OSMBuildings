#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec4 aColor;

uniform mat4 uMatrix;
varying vec4 vPosition;

void main() {

  if (aColor.a == 0.0) {
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
    vPosition = vec4(0.0, 0.0, 0.0, 0.0);
  } else {
    gl_Position = uMatrix * aPosition;
    vPosition = uMatrix * aPosition;
  }
}
