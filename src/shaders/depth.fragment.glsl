
precision mediump float;

varying vec4 vPosition;

float total_depth = 64.0;

void main() {
	gl_FragColor = vec4(vPosition.xyz, length(vPosition) / total_depth);
}
