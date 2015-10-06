#ifdef GL_ES
  precision mediump float;
#endif

//uniform sampler2D uTexIndex;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main() {
  gl_FragColor = vec4( (vNormal + 1.0)/2.0, 1.0);
}
