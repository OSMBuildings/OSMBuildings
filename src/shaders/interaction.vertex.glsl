
precision mediump float;

attribute vec4 aPosition;
attribute vec3 aColor;
attribute float aHidden;

uniform mat4 uMatrix;

varying vec3 vColor;

void main() {
  if (aHidden == 1.0) {
    gl_Position = vec4(0.0);
    vColor = vec3(0.0);
  } else {
    gl_Position = uMatrix * aPosition;
    vColor = aColor;
  }
}
