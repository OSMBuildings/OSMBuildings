precision highp float;  //is default in vertex shaders anyway, using highp fixes #49

attribute vec4 aPosition;
attribute vec4 aFilter;
attribute vec3 aNormal;

uniform mat4 uMatrix;
uniform mat4 uModelMatrix;
uniform mat3 uNormalMatrix;
uniform vec2 uViewDirOnMap;
uniform vec2 uLowerEdgePoint;

varying float verticalDistanceToLowerEdge;
varying vec3 vNormal;
uniform float uTime;

void main() {

  float t = clamp((uTime-aFilter.r) / (aFilter.g-aFilter.r), 0.0, 1.0);
  float f = aFilter.b + (aFilter.a-aFilter.b) * t;

  if (f == 0.0) {
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
    verticalDistanceToLowerEdge = 0.0;
  } else {
    vec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);

    gl_Position = uMatrix * pos;
    vNormal = uNormalMatrix * aNormal;

    vec4 worldPos = uModelMatrix * pos;
    vec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;
    verticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);
  }
}
