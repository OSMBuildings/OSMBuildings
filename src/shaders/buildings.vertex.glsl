
precision mediump float;

attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;
attribute float aHidden;

uniform mat4 uMatrix;
uniform mat3 uNormalTransform;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;

varying vec3 vColor;
varying vec4 vPosition;

void main() {
  if (aHidden == 1.0) {
    gl_Position = vec4(0.0);
    vPosition = vec4(0.0);
    vColor = vec3(0.0, 0.0, 0.0);
  } else {
    gl_Position = uMatrix * aPosition;
    vPosition = aPosition;

    vec3 transformedNormal = aNormal * uNormalTransform;
    float intensity = max( dot(transformedNormal, uLightDirection), 0.0) / 1.5;
    vColor = aColor + uLightColor * intensity;
  }
}