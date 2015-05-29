
precision mediump float;

attribute vec4 aPosition;
attribute vec3 aColor;
attribute float aScaleZ;

uniform mat4 uMatrix;

varying vec3 vColor;

void main() {
  vec4 pos = aPosition;
  pos.z = pos.z * aScaleZ;
  gl_Position = uMatrix * pos;
  vColor = aColor;
}
