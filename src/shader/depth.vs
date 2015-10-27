#ifdef GL_ES
  precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec4 aFilter;

uniform mat4 uMatrix;
uniform mat4 uModelMatrix;

uniform float uTime;

varying vec3 vWorldPosition;

void main() {

  float t = clamp((uTime-aFilter.r) / (aFilter.g-aFilter.r), 0.0, 1.0);
  float te = t*(2.0-t); // quadratic ease out
  float f = aFilter.b + (aFilter.a-aFilter.b) * te;

  if (f == 0.0) {
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
    vWorldPosition = vec3(0.0, 0.0, 0.0);
  } else {
    vec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);

    gl_Position = uMatrix * pos;

    /* in order for the SSAO (which is based on this depth shader) to work
     * correctly in conjunction with the fog shading, we need to replicate
     * the fog computation here. This way, the ambient occlusion shader can
     * later attenuate the ambient occlusion effect in the foggy areas.
     * However, we cannot simply replicate the vertex shader-based fog
     * computation here, because it won't work with the dummy map plane:
     * The map plane is centered directly below the camera, so all four
     * of its vertices have the same distance from the camera. With the
     * current fog model, this means that they also are all equally foggy.
     * Computing the fog intensity in the vertex shader would therefor
     * interpolate this identical fog intensity over the whole quad, meaning
     * that all its pixels would incorrectly appear equally foggy (The normal
     * fogging for map tiles and buildings has the same issue, but can get away
     * with it, because it shades rather small objects where each face indeed
     * has an almost constant fog intensity).
     * Instead, we only compute the world-space vertex positions here, let them
     * - correctly - get interpolated by the rasterizing stage, and then
     * compute the correct fog intensities per pixel in the fragment shader */

    vec4 worldPos = uModelMatrix * pos;
    vWorldPosition = worldPos.xyz / worldPos.w;
  }
}
