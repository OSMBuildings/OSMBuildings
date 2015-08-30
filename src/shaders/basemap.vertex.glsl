#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uMMatrix;
uniform mat4 uMatrix;

uniform float uFogRadius;

varying vec2 vTexCoord;
varying float vFogIntensity;

float fogBlur = uFogRadius * 0.95;

void main() {

  vec4 glPosition = uMatrix * aPosition;
  gl_Position = glPosition;

  vTexCoord = aTexCoord;

  //*** fog *******************************************************************

  vec4 mPosition = uMMatrix * aPosition;
  float distance = length(mPosition);
  float fogIntensity = (distance - fogBlur) / (uFogRadius - fogBlur);
  vFogIntensity = clamp(fogIntensity, 0.0, 1.0);
}
