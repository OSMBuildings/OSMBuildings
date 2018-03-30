precision highp float;  //is default in vertex shaders anyway, using highp fixes #49

#define halfPi 1.57079632679

attribute vec4 aPosition;
attribute vec3 aId;

uniform mat4 uModelMatrix;
uniform mat4 uMatrix;

uniform float uFogRadius;
uniform float uTime;

varying vec4 vColor;

void main() {

  # float f = clamp(uTime, 0.0, 1.0);
  float f = 1.0;

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
