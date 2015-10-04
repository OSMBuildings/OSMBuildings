
precision mediump float;

attribute vec4 aPosition;
attribute vec3 aNormal;
attribute float aDataIndex;

uniform mat4 uMatrix;
uniform mat3 uNormalTransform;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform sampler2D uDataTexture;
uniform float uDataTextureSize;

varying vec3 vColor;
varying float vHeight;
varying vec4 vPosition;

float step = 1.0 / uDataTextureSize;

vec4 getTexel(float index) {
  vec2 xy = vec2( mod(index, 1.0), floor(index)/uDataTextureSize );
  return texture2D(uDataTexture, xy);
}

void main() {
  gl_Position = uMatrix * aPosition;
  vPosition = aPosition;

  vec4 texelA = getTexel(aDataIndex);
  vec4 texelB = getTexel(aDataIndex+step);

  vec3 idColor = texelA.xyz;
  vec3 color = texelB.xyz;
  vHeight = 90.0; // texelA.w;

  vec3 transformedNormal = aNormal * uNormalTransform;
  float intensity = max( dot(transformedNormal, uLightDirection), 0.0) / 1.5;
  vColor = color + uLightColor * intensity;
}
