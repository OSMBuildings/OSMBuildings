#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uMatrix;
uniform mat4 uFogMatrix;
//uniform mat4 uFogOrigin;
uniform float uFogNear;
uniform float uFogFar;

varying vec2 vTexCoord;
varying float vFogIntensity;

void main() {
  vec4 glPosition = vec4(uMatrix * aPosition);

  vTexCoord = aTexCoord;

  vec4 fogOrigin = vec4(uFogMatrix * vec4(0.0, 0.0, 0.0, 1.0));
  float distance = length(glPosition - fogOrigin);
//float distance = length(glPosition - uFogOrigin);
  float fogIntensity = (distance - uFogNear) / (uFogFar - uFogNear);
  vFogIntensity = clamp(fogIntensity, 0.0, 1.0);

  gl_Position = glPosition;
}
