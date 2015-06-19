#ifdef GL_ES
precision mediump float;
#endif

uniform float uAlpha;

varying vec4 vPosition;
varying vec3 vColor;

float gradientHeight = 90.0;
float maxGradientStrength = 0.3;

void main() {
  float shading = clamp((gradientHeight-vPosition.z) / (gradientHeight/maxGradientStrength), 0.0, maxGradientStrength);
  gl_FragColor = vec4(vColor - shading, uAlpha);
}
