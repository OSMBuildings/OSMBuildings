#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec4 aFilter;

uniform mat4 uMatrix;

varying vec3 vNormal;

void main() {

  if (aFilter.a == 0.0) {
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
    vNormal = vec3(0.0, 0.0, 0.0);
  } else {
    gl_Position = uMatrix * aPosition;
    vNormal = aNormal;
  }
}