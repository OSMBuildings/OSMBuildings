
precision mediump float;

varying vec4 vPosition;

void main() {
	gl_FragColor = vec4(vPosition.xyz, length(vPosition));
}
