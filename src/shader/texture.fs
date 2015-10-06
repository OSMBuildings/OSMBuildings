#ifdef GL_ES
  precision mediump float;
#endif

uniform sampler2D uTexIndex;

varying vec2 vTexCoord;

void main() {
  gl_FragColor = vec4(texture2D(uTexIndex, vTexCoord.st).rgb, 1.0);
}
