precision highp float;  //is default in vertex shaders anyway, using highp fixes #49

attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uMatrix;
uniform mat4 uSunMatrix;

uniform vec2 uViewDirOnMap;
uniform vec2 uLowerEdgePoint;

//varying vec2 vTexCoord;
varying vec3 vSunRelPosition;
varying vec3 vNormal;
varying float verticalDistanceToLowerEdge;

void main() {

  vec4 pos = vec4(aPosition.xyz, 1.0);
  gl_Position = uMatrix * pos;
  vec4 sunRelPosition = uSunMatrix * pos;
  vSunRelPosition = (sunRelPosition.xyz / sunRelPosition.w + 1.0) / 2.0;

  vNormal = aNormal;

  vec4 worldPos = uModelMatrix * pos;
  vec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;
  verticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);
}
