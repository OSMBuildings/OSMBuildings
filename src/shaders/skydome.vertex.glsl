#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uMatrix;

varying vec2 vTexCoord;
varying float vFogIntensity;

float gradientHeight = 10.0;
float gradientStrength = 1.0;

void main() {
  gl_Position = uMatrix * aPosition;

  vTexCoord = aTexCoord;
  vFogIntensity = clamp((gradientHeight-aPosition.z) / (gradientHeight/gradientStrength), 0.0, gradientStrength);
}
