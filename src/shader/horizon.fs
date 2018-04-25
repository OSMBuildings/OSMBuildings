#ifdef GL_ES
  precision mediump float;
#endif

uniform sampler2D uTexIndex;
uniform vec3 uFogColor;

varying vec2 vTexCoord;
varying float vRelativeHeight;

void main() {
  float blendFactor = min(100.0 * vRelativeHeight, 1.0);
  vec4 texColor = texture2D(uTexIndex, vTexCoord);
  gl_FragColor = mix( vec4(uFogColor, 1.0), texColor,  blendFactor);
}
