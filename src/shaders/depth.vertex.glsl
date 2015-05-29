
precision mediump float;

attribute vec4 aPosition;
attribute float aScaleZ;

uniform mat4 uMatrix;

varying vec4 vPosition;

void main() {
  vec4 pos = aPosition;
  pos.z = pos.z * aScaleZ;
  vPosition = uMatrix * pos;
	gl_Position = vPosition;
}
