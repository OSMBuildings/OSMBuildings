#ifdef GL_ES
  precision mediump float;
#endif

uniform sampler2D uTexIndex;
uniform vec3 uFogColor;

varying vec2 vTexCoord;
varying float vFogIntensity;

void main() {
  vec3 color = vec3(texture2D(uTexIndex, vec2(vTexCoord.x, 1.0-vTexCoord.y)));
  gl_FragColor = vec4(mix(color, uFogColor, vFogIntensity), 1.0);
}
