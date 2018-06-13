#ifdef GL_ES
  precision mediump float;
#endif

uniform vec3 uFogColor;

varying float vRelativeHeight;

void main() {
  float blendFactor = min(100.0 * vRelativeHeight, 1.0);
  vec4 skyColor = vec4(0.9, 0.85, 1.0, 1.0);
  gl_FragColor = mix(vec4(uFogColor, 1.0), skyColor, blendFactor);
}
