#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;
attribute vec3 aIDColor;
attribute float aHidden;

uniform mat4 uMatrix;
uniform mat3 uNormalTransform;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uHighlightColor;
uniform vec3 uHighlightID;

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

    if (uHighlightID.r == aIDColor.r && uHighlightID.g == aIDColor.g && uHighlightID.b == aIDColor.b) {
      vColor = mix(aColor, uHighlightColor, 0.5);
    } else {
      vColor = aColor;
    }

    vColor = vColor + uLightColor * intensity;

  }
}