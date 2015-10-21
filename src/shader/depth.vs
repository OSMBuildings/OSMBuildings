#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;

uniform mat4 uMatrix;
uniform mat4 uModelMatrix;

uniform float uFogRadius;
const float fogBlur = 200.0;

varying float fogIntensity;

void main() {

  gl_Position = uMatrix * aPosition;

  //replicate fog computation from the building and basemap shaders
  vec4 mPosition = uModelMatrix * aPosition;
  float dist = length(mPosition);
  fogIntensity = (dist - uFogRadius) / fogBlur + 1.1;
  fogIntensity = clamp(fogIntensity, 0.0, 1.0);
}
