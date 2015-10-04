#ifdef GL_ES
  precision mediump float;
#endif

#define halfPi 1.57079632679

attribute vec4 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform mat4 uMatrix;

uniform float uFogRadius;

varying vec2 vTexCoord;
varying float vFogIntensity;

float fogBlur = 200.0;

//uniform float uRadius;
//uniform float uDistance;
float uRadius = 500.0;
float uDistance = 700.0;

void main() {

  //*** bending ***************************************************************

  vec4 mwPosition = uViewMatrix * uModelMatrix * aPosition;

  float innerRadius = uRadius + mwPosition.y;
  float depth = abs(mwPosition.z);
  float s = depth-uDistance;
  float theta = min(max(s, 0.0)/uRadius, halfPi);

  // halfPi*uRadius, not halfPi*innerRadius, because the "base" of a building
  // travels the full uRadius path
  float newY = cos(theta)*innerRadius -uRadius - max(s-halfPi*uRadius, 0.0);
  float newZ = normalize(mwPosition.z) * (min(depth, uDistance) + sin(theta)*innerRadius);

  vec4 newPosition = vec4(mwPosition.x, newY, newZ, 1.0);
  vec4 glPosition = uProjMatrix * newPosition;

//  vec4 glPosition = uMatrix * aPosition;
  gl_Position = glPosition;

  vTexCoord = aTexCoord;

  //*** fog *******************************************************************

  vec4 mPosition = uModelMatrix * aPosition;
  float distance = length(mPosition);
  // => (distance - (uFogRadius - fogBlur)) / (uFogRadius - (uFogRadius - fogBlur));
  float fogIntensity = (distance - uFogRadius) / fogBlur + 1.1; // <- shifts blur in/out

  vFogIntensity = clamp(fogIntensity, 0.0, 1.0);
  //vFogIntensity = 0.0;
}
