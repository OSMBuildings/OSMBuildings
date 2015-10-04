#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec3 aColor;

uniform mat4 uMMatrix;
uniform mat4 uMatrix;

uniform float uFogRadius;

varying vec4 vColor;

void main() {
  gl_Position = uMatrix * aPosition;

  vec4 mPosition = vec4(uMMatrix * aPosition);
  float distance = length(mPosition);

  if (distance > uFogRadius) {
    vColor = vec4(0.0, 0.0, 0.0, 0.0);
  } else {
    vColor = vec4(aColor, 1.0);
  }
}
