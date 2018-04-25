
#ifdef GL_ES
  precision mediump float;
#endif

uniform float uFogDistance;
uniform float uFogBlurDistance;

varying float verticalDistanceToLowerEdge;
varying vec3 vNormal;

void main() {
  float fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;
  gl_FragColor = vec4(normalize(vNormal) / 2.0 + 0.5, clamp(fogIntensity, 0.0, 1.0));
}
