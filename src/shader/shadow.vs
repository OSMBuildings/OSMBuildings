#ifdef GL_ES
  precision mediump float;
#endif

#define halfPi 1.57079632679

attribute vec3 aPosition;
attribute vec4 aFilter;
attribute vec3 aNormal;
//attribute vec2 aTexCoord;

uniform mat4 uModelMatrix;
//uniform mat4 uViewMatrix;
//uniform mat4 uProjMatrix;
uniform mat4 uMatrix;
uniform mat4 uSunMatrix;

uniform vec2 uViewDirOnMap;
uniform vec2 uLowerEdgePoint;
uniform float uTime;

//varying vec2 vTexCoord;
varying vec3 vSunRelPosition;
varying vec3 vNormal;
varying float verticalDistanceToLowerEdge;


void main() {

  float t = clamp((uTime-aFilter.r) / (aFilter.g-aFilter.r), 0.0, 1.0);
  float f = aFilter.b + (aFilter.a-aFilter.b) * t;

  if (f == 0.0) {
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
    vSunRelPosition = vec3(0.0, 0.0, 0.0);
    vNormal = vec3(0.0, 0.0, 1.0);
    verticalDistanceToLowerEdge = 0.0;
  } else {
    vec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, 1.0);
    gl_Position = uMatrix * pos;
    vec4 sunRelPosition = uSunMatrix * pos;
    vSunRelPosition = (sunRelPosition.xyz / sunRelPosition.w + 1.0) / 2.0;
    //vSunRelPosition.xy = (vSunRelPosition.xy + 1.0)/2.0;
    
  //  vTexCoord = vec2(aTexCoord.x, 1.0 - aTexCoord.y);
    vNormal = aNormal;

    vec4 worldPos = uModelMatrix * pos;
    vec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;
    verticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);
  }
}
