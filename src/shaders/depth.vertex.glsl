
precision mediump float;

attribute vec4 aPosition;
attribute float aHidden;

uniform mat4 uMatrix;

varying vec4 vPosition;

void main() {
  if (aHidden == 1.0) {
    vPosition = vec4(0.0);
    gl_Position = vPosition;
  } else {
    vPosition = uMatrix * aPosition;
    gl_Position = vPosition;
  }
}
