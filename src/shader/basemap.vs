precision highp float; // is default in vertex shaders anyway, using highp fixes #49

#define halfPi 1.57079632679

attribute vec4 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

uniform vec2 uViewDirOnMap;
uniform vec2 uLowerEdgePoint;

varying vec2 vTexCoord;
varying float verticalDistanceToLowerEdge;

void main() {
  gl_Position = uViewMatrix * aPosition;

  vTexCoord = aTexCoord;

  vec4 worldPos = uModelMatrix * aPosition;
  vec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;
  verticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);
}
