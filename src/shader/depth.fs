
#ifdef GL_ES
  precision mediump float;
#endif

uniform float uFogDistance;
uniform float uFogBlurDistance;
uniform int   uIsPerspectiveProjection;

varying float verticalDistanceToLowerEdge;
varying vec3 vNormal;

/* Note: the depth shader needs to not only store depth information, but
 *       also the fog intensity as well.
 * Rationale: In the current infrastructure, ambient occlusion does not 
 * directly affect the building and map shading, but rather is later blended 
 * onto the whole scene as a screen-space effect. This, however, is not
 * compatible with fogging: buildings in the fog gradually blend into the 
 * background, but the ambient occlusion applied in screen space does not.
 * In the foggy area, this yields barely visible buildings with fully visible
 * ambient occlusion - an irritating effect.
 * To fix this, the depth shader stores not only depth values per pixel, but
 * also computes the fog intensity and stores it in the depth texture along
 * with the color-encoded depth values.
 * This way, the ambient occlusion shader can later not only compute the
 * actual ambient occlusion based on the depth values, but can attenuate
 * the effect in the foggy areas based on the fog intensity.
 */

void main() {
  float fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;
  gl_FragColor = vec4(normalize(vNormal) /2.0 + 0.5, clamp(fogIntensity, 0.0, 1.0));
}
