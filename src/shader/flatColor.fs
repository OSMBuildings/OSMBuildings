#ifdef GL_ES
  precision mediump float;
#endif

uniform vec4 uColor;

void main() {
  gl_FragColor = uColor;
}
