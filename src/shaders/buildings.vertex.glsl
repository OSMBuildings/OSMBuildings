#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;

uniform mat4 uMatrix;
uniform mat3 uNormalTransform;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uCamPosition;
uniform float uFogNear;
uniform float uFogFar;

varying vec3 vColor;
varying vec4 vPosition;
varying float vFogIntensity;

void main() {
//  if (aHidden == 1.0) {
//    gl_Position = vec4(0.0);
//    vPosition = vec4(0.0);
//    vColor = vec3(0.0, 0.0, 0.0);
//  }

  vec4 position = vec4(uMatrix * aPosition);
  vec2 positionXZ = vec2(position.x, position.z);
  vec2 camPositionXZ = vec2(uCamPosition.x, uCamPosition.z);
  float distanceXZ = length(positionXZ - camPositionXZ);
  float fogIntensity = (distanceXZ - uFogNear) / (uFogFar - uFogNear);
  vFogIntensity = clamp(fogIntensity, 0.0, 1.0);

  vec3 transformedNormal = aNormal * uNormalTransform;
  float intensity = max( dot(transformedNormal, uLightDirection), 0.0) / 1.5;
  vColor = aColor + uLightColor * intensity;

  gl_Position = position;
  vPosition = aPosition;
}

