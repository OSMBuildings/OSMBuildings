#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec4 aFilter;

uniform mat4 uMatrix;
uniform mat4 uModelMatrix;
uniform vec2 uViewDirOnMap;
uniform vec2 uLowerEdgePoint;

varying float verticalDistanceToLowerEdge;
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

    /* in order for the SSAO (which is based on this depth shader) to work
     * correctly in conjunction with the fog shading, we need to replicate
     * the fog computation here. This way, the ambient occlusion shader can
     * later attenuate the ambient occlusion effect in the foggy areas.*/

    vec4 worldPos = uModelMatrix * pos;
    vec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;
    verticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);
  }
}
