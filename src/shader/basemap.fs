#ifdef GL_ES
  precision mediump float;
#endif

uniform sampler2D uTexIndex;
uniform vec3 uFogColor;

varying vec2 vTexCoord;

uniform float uFogDistance;
uniform float uFogBlurDistance;

void main() {
  float dist = gl_FragCoord.z / gl_FragCoord.w;
  float fogIntensity = (dist - uFogDistance) / uFogBlurDistance;
  fogIntensity = clamp(fogIntensity, 0.0, 1.0);

  vec3 color = vec3(texture2D(uTexIndex, vec2(vTexCoord.x, 1.0-vTexCoord.y)));
  gl_FragColor = vec4(mix(color, uFogColor, fogIntensity), 1.0);
}
