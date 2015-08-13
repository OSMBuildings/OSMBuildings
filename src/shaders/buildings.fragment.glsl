#ifdef GL_ES
precision mediump float;
#endif

uniform float uAlpha;
uniform vec4 uFogColor;

varying vec4 vPosition;
varying vec3 vColor;
varying float vFogIntensity;

float gradientHeight = 90.0;
float maxGradientStrength = 0.3;

void main() {
  float heightShading = clamp((gradientHeight-vPosition.z) / (gradientHeight/maxGradientStrength), 0.0, maxGradientStrength);
  gl_FragColor = mix(vec4(vColor - heightShading, uAlpha), uFogColor, vFogIntensity);
}
