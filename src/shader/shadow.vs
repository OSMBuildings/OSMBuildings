#ifdef GL_ES
  precision mediump float;
#endif

#define halfPi 1.57079632679

attribute vec3 aPosition;
//attribute vec2 aTexCoord;

uniform mat4 uModelMatrix;
//uniform mat4 uViewMatrix;
//uniform mat4 uProjMatrix;
uniform mat4 uMatrix;
uniform mat4 uSunMatrix;

uniform vec2 uViewDirOnMap;
uniform vec2 uLowerEdgePoint;

//varying vec2 vTexCoord;
varying vec3 vSunRelPosition;
varying float verticalDistanceToLowerEdge;

uniform float uBendRadius;
uniform float uBendDistance;

void main() {

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
//  vec4 glPosition = uProjMatrix * newPosition;

  gl_Position = uMatrix * vec4(aPosition, 1.0);
  vec4 sunRelPosition = uSunMatrix * vec4(aPosition, 1.0);
  vSunRelPosition = (sunRelPosition.xyz / sunRelPosition.w + 1.0) / 2.0;
  //vSunRelPosition.xy = (vSunRelPosition.xy + 1.0)/2.0;
  
//  vTexCoord = vec2(aTexCoord.x, 1.0 - aTexCoord.y);

  vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
  vec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;
  verticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);
}
