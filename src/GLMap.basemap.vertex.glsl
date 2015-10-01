#ifdef GL_ES
  precision mediump float;
#endif

#define pi2 1.57079632679

attribute vec4 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uMatrix;
uniform mat4 uMMatrix;
uniform mat4 vpMatrix;
uniform mat4 tMatrix;
uniform mat4 pMatrix;

uniform float uFogRadius;

varying vec2 vTexCoord;
varying float vFogIntensity;

float fogBlur = 300.0;

uniform float uRadius;
uniform float uDistance;

void main() {

  vec4 mwPosition = tMatrix * uMMatrix * aPosition;

  float innerRadius = uRadius + mwPosition.y;
  float depth = abs(mwPosition.z);
  float s = depth-uDistance;
  float theta = min(max(s, 0.0 )/uRadius,pi2);
  
  float newy = cos(theta)*innerRadius -uRadius  - max(s-pi2*uRadius, 0.0);
  float newz = normalize(mwPosition.z) * (min(depth, uDistance) + sin(theta)*innerRadius);

  vec4 newPosition = vec4( mwPosition.x, newy, newz, 1.0 );

  gl_Position = pMatrix * newPosition;
  vTexCoord = aTexCoord;

  //*** fog *******************************************************************

  vec4 mPosition = uMMatrix * aPosition;
  float distance = length(mPosition);
  // => (distance - (uFogRadius - fogBlur)) / (uFogRadius - (uFogRadius - fogBlur));
  float fogIntensity = (distance - uFogRadius) / fogBlur + 1.1; // <- shifts blur in/out

  vFogIntensity = clamp(fogIntensity, 0.0, 0.2);
  //vFogIntensity = 0.0;
}
