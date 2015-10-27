#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec4 aFilter;

uniform mat4 uMatrix;

uniform float uTime;

varying vec3 vNormal;

void main() {

  float t = clamp((uTime-aFilter.r) / (aFilter.g-aFilter.r), 0.0, 1.0);
  float te = t*(2.0-t); // quadratic ease out
  float f = aFilter.b + (aFilter.a-aFilter.b) * te;

  if (f == 0.0) {
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
    vNormal = vec3(0.0, 0.0, 0.0);
  } else {
    gl_Position = uMatrix * vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);
    vNormal = aNormal;
  }
}