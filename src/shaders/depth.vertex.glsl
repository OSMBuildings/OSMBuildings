
precision mediump float;

attribute vec4 aPosition;

uniform mat4 uMatrix;

varying vec4 vPosition;

void main() {
	vPosition = uMatrix * aPosition;
	gl_Position = vPosition;
}
