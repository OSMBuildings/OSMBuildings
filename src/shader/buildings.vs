#ifdef GL_ES
  precision mediump float;
#endif

#define halfPi 1.57079632679

attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;
attribute vec3 aIDColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform mat4 uMatrix;

uniform mat3 uNormalTransform;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;

uniform vec3 uFogColor;
uniform float uFogRadius;

uniform vec3 uHighlightColor;
uniform vec3 uHighlightID;

varying vec3 vColor;

float fogBlur = 200.0;

//float gradientHeight = 90.0;
//float gradientStrength = 0.4;

// helsinki has small buildings:
float gradientHeight = 30.0;
float gradientStrength = 0.3;

uniform float uRadius;
uniform float uDistance;

void main() {

  //*** bending ***************************************************************

//  vec4 mwPosition = uViewMatrix * uModelMatrix * aPosition;
//
//  float innerRadius = uRadius + mwPosition.y;
//  float depth = abs(mwPosition.z);
//  float s = depth-uDistance;
//  float theta = min(max(s, 0.0 )/uRadius, halfPi);
//
//  // pi2*uRadius, not pi2*innerRadius, because the "base" of a building
//  // travels the full uRadius path
//  float newy = cos(theta)*innerRadius -uRadius - max(s-halfPi*uRadius, 0.0);
//  float newz = normalize(mwPosition.z) * (min(depth, uDistance) + sin(theta)*innerRadius);
//
//  vec4 newPosition = vec4( mwPosition.x, newy, newz, 1.0 );
//
//  gl_Position = uProjMatrix * newPosition;

  gl_Position = uMatrix * aPosition;

  //*** highlight object ******************************************************

  vec3 color = aColor;
  if (uHighlightID.r == aIDColor.r && uHighlightID.g == aIDColor.g && uHighlightID.b == aIDColor.b) {
    color = mix(aColor, uHighlightColor, 0.5);
  }

  //*** light intensity, defined by light direction on surface ****************

  vec3 transformedNormal = aNormal * uNormalTransform;
  float lightIntensity = max( dot(transformedNormal, uLightDirection), 0.0) / 1.5;
  color = color + uLightColor * lightIntensity;

  //*** vertical shading ******************************************************

  float verticalShading = clamp((gradientHeight-aPosition.z) / (gradientHeight/gradientStrength), 0.0, gradientStrength);

  //*** fog *******************************************************************

  vec4 mPosition = uModelMatrix * aPosition;
  float distance = length(mPosition);
  float fogIntensity = (distance - uFogRadius) / fogBlur + 1.1; // <- shifts blur in/out
  fogIntensity = clamp(fogIntensity, 0.0, 1.0);

  //***************************************************************************

  vColor = mix(vec3(color - verticalShading), uFogColor, fogIntensity);
}
