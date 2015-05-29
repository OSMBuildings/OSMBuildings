
precision mediump float;

attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;
attribute float aScaleZ;

uniform mat4 uMatrix;
uniform mat3 uNormalTransform;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;

varying vec3 vColor;
varying vec4 vPosition;

void main() {
  vec4 pos = aPosition;
  pos.z = pos.z * aScaleZ;
  vPosition = uMatrix * pos;
  gl_Position = vPosition;

  vec3 transformedNormal = aNormal * uNormalTransform;
  float intensity = max( dot(transformedNormal, uLightDirection), 0.0) / 1.5;
  vColor = aColor + uLightColor * intensity;
}