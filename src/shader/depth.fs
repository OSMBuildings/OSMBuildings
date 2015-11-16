
#ifdef GL_ES
  precision mediump float;
#endif

uniform float uFogDistance;
uniform float uFogBlurDistance;

varying float verticalDistanceToLowerEdge;

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
  float z = gl_FragCoord.z;
  float z1 = fract(z*255.0);
  float z2 = fract(z1*255.0);
  //this biasing is necessary for shadow mapping to work correctly
  //source: http://forum.devmaster.net/t/shader-effects-shadow-mapping/3002
  // this might be due to the GPU *rounding* the float values to the nearest uint8_t instead of the expeected *truncating*
  z  -= 1.0/255.0*z1;
  z1 -= 1.0/255.0*z2;

  float fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;
  fogIntensity = clamp(fogIntensity, 0.0, 1.0);

  // option 1: this line outputs high-precision (24bit) depth values
  gl_FragColor = vec4(z, z1, z2, fogIntensity);
  
  // option 2: this line outputs human-interpretable depth values, but with low precision
  //gl_FragColor = vec4(z, z, z, 1.0); 

}
