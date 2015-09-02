#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;
attribute vec3 aIDColor;

uniform mat4 uMatrix;
uniform mat4 uMMatrix;

uniform mat3 uNormalTransform;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;

uniform vec3 uFogColor;
uniform float uFogRadius;

uniform vec3 uHighlightColor;
uniform vec3 uHighlightID;

varying vec3 vColor;

float fogBlur = 200.0;

float gradientHeight = 90.0;
float gradientStrength = 0.4;

void main() {

  vec4 glPosition = uMatrix * aPosition;
  gl_Position = glPosition;

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

  vec4 mPosition = uMMatrix * aPosition;
  float distance = length(mPosition);
  float fogIntensity = (distance - uFogRadius) / fogBlur + 1.1; // <- shifts blur in/out
  fogIntensity = clamp(fogIntensity, 0.0, 1.0);

  //***************************************************************************

  vColor = mix(vec3(color - verticalShading), uFogColor, fogIntensity);
}
