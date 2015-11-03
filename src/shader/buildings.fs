#ifdef GL_ES
  precision mediump float;
#endif

varying vec3 vColor;
varying float verticalDistanceToLowerEdge;

uniform vec3 uFogColor;
uniform float uFogDistance;
uniform float uFogBlurDistance;

void main() {
    
  float fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;
  fogIntensity = clamp(fogIntensity, 0.0, 1.0);

  gl_FragColor = vec4( mix(vColor, uFogColor, fogIntensity), 1.0);
}
