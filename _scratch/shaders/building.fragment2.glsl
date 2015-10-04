
precision mediump float;

uniform float uAlpha;

// sampler2D and the lookup are necessary to have them available in vertex shader on some browsers
uniform sampler2D uDataTexture;
vec4 unused = texture2D(uDataTexture, vec2(0.0, 0.0));

varying vec4 vPosition;
varying vec3 vColor;
varying float vHeight;

float maxGradientStrength = 0.3;

void main() {
  float shading = clamp((vHeight-vPosition.z) / (vHeight/maxGradientStrength), 0.0, maxGradientStrength);
  gl_FragColor = vec4(vColor - shading, uAlpha);
}
