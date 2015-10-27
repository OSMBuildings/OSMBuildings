#ifdef GL_ES
  precision mediump float;
#endif

#define halfPi 1.57079632679

attribute vec4 aPosition;
attribute vec3 aID;
attribute vec4 aFilter;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;
uniform mat4 uMatrix;

uniform float uFogRadius;

uniform float uTime;

varying vec4 vColor;

uniform float uBendRadius;
uniform float uBendDistance;

void main() {

  float t = clamp((uTime-aFilter.r) / (aFilter.g-aFilter.r), 0.0, 1.0);
  float te = t*(2.0-t); // quadratic ease out
  float f = aFilter.b + (aFilter.a-aFilter.b) * te;

  if (f == 0.0) {
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
    vColor = vec4(0.0, 0.0, 0.0, 0.0);
  } else {
    vec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);

    //*** bending ***************************************************************

  //  vec4 mwPosition = uViewMatrix * uModelMatrix * aPosition;
  //
  //  float innerRadius = uBendRadius + mwPosition.y;
  //  float depth = abs(mwPosition.z);
  //  float s = depth-uBendDistance;
  //  float theta = min(max(s, 0.0)/uBendRadius, halfPi);
  //
  //  // halfPi*uBendRadius, not halfPi*innerRadius, because the "base" of a building
  //  // travels the full uBendRadius path
  //  float newY = cos(theta)*innerRadius - uBendRadius - max(s-halfPi*uBendRadius, 0.0);
  //  float newZ = normalize(mwPosition.z) * (min(depth, uBendDistance) + sin(theta)*innerRadius);
  //
  //  vec4 newPosition = vec4(mwPosition.x, newY, newZ, 1.0);
  //  gl_Position = uProjMatrix * newPosition;

    gl_Position = uMatrix * pos;

    vec4 mPosition = vec4(uModelMatrix * pos);
    float distance = length(mPosition);

    if (distance > uFogRadius) {
      vColor = vec4(0.0, 0.0, 0.0, 0.0);
    } else {
      vColor = vec4(aID, 1.0);
    }
  }
}
