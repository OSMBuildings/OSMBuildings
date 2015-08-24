#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uMatrix;
uniform mat4 uVPMatrix;
//uniform mat4 uFogOrigin;
uniform float uFogRadius;

varying vec2 vTexCoord;
varying float vFogIntensity;

float fogBlur = uFogRadius * 0.95;

void main() {

  vec4 glPosition = vec4(uMatrix * aPosition);
  gl_Position = glPosition;

  vTexCoord = aTexCoord;

  //*** fog *******************************************************************

  vec4 fogOrigin = vec4(uVPMatrix * vec4(0.0, 0.0, 0.0, 1.0));
  float distance = length(glPosition - fogOrigin);
//float distance = length(glPosition - uFogOrigin);
  float fogIntensity = (distance - fogBlur) / (uFogRadius - fogBlur);
  vFogIntensity = clamp(fogIntensity, 0.0, 1.0);
}
