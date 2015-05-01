
precision mediump float;

attribute vec4 aPosition;
attribute vec3 aColor;

uniform mat4 uMatrix;

varying vec3 vColor;

void main() {
  gl_Position = uMatrix * aPosition;
  vColor = aColor;
}
