#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec4 aColor;

uniform mat4 uMatrix;
uniform mat4 uModelMatrix;
uniform vec2 uViewDirOnMap;

varying float verticalDistanceToMapCenter;

void main() {

  if (aColor.a == 0.0) {
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
    verticalDistanceToMapCenter = 0.0;
  } else {
    gl_Position = uMatrix * aPosition;

    /* in order for the SSAO (which is based on this depth shader) to work
     * correctly in conjunction with the fog shading, we need to replicate
     * the fog computation here. This way, the ambient occlusion shader can
     * later attenuate the ambient occlusion effect in the foggy areas.*/

    vec4 worldPos = uModelMatrix * aPosition;
    verticalDistanceToMapCenter = dot(worldPos.xy / worldPos.w, uViewDirOnMap);
  }
}
