precision highp float;  //is default in vertex shaders anyway, using highp fixes #49

#define halfPi 1.57079632679

attribute vec4 aPosition;
attribute vec3 aId;
attribute vec4 aFilter;

uniform mat4 uModelMatrix;
uniform mat4 uMatrix;

uniform float uFogRadius;
uniform float uTime;

varying vec4 vColor;

void main() {

  float t = clamp((uTime-aFilter.r) / (aFilter.g-aFilter.r), 0.0, 1.0);
  float f = aFilter.b + (aFilter.a-aFilter.b) * t;

  if (f == 0.0) {
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
    vColor = vec4(0.0, 0.0, 0.0, 0.0);
  } else {
    vec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);
    gl_Position = uMatrix * pos;

    vec4 mPosition = vec4(uModelMatrix * pos);
    float distance = length(mPosition);

    if (distance > uFogRadius) {
      vColor = vec4(0.0, 0.0, 0.0, 0.0);
    } else {
      vColor = vec4(aId, 1.0);
    }
  }
}
