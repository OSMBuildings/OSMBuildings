#ifdef GL_ES
precision mediump float;
#endif

varying vec4 vPosition;

void main() {
	gl_FragColor = vec4(vPosition.xyz, length(vPosition));
}
