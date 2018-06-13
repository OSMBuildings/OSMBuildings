precision highp float;  //is default in vertex shaders anyway, using highp fixes #49

attribute vec4 aPosition;
attribute vec3 aNormal;
attribute float aZScale;

uniform mat4 uMatrix;
uniform mat4 uModelMatrix;
uniform mat3 uNormalMatrix;
uniform vec2 uViewDirOnMap;
uniform vec2 uLowerEdgePoint;
uniform float uFade;

varying float verticalDistanceToLowerEdge;
varying vec3 vNormal;

void main() {

  float f = clamp(uFade*aZScale, 0.0, 1.0);

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
