#ifdef GL_ES
  precision mediump float;
#endif


uniform sampler2D uTexIndex;
varying vec2 vTexCoord;

void main() {


  gl_FragColor = vec4(texture2D(uTexIndex, vec2(vTexCoord.x, 1.0-vTexCoord.y)).rgb, 1.0);

  //gl_FragColor = vec4(0.9, 0.5, 0.8, 0.8);
}
