
#ifdef GL_ES
  precision mediump float;
#endif

uniform float uFogDistance;
uniform float uFogBlurDistance;
uniform int   uIsPerspectiveProjection;

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
  /* for an orthographic projection, the value in gl_FragCoord.z is proportional 
   * to the fragment's 'physical' depth value. It's just scaled down so that the
   * whole depth range can be compressed into [0..1]. This is quite suitable for
   * processing in subsequent shaders.
   * For perspective projections, however, the relationship between 'physical'
   * depth values and gl_FragCoord.z is distorted by the perspective division.
   * So we attempt correct that distortion when the fragment was created
   * through a perspective projection.
   **/
  float z = uIsPerspectiveProjection == 0 ?  gl_FragCoord.z : 
                                            (gl_FragCoord.z / gl_FragCoord.w)/7500.0;
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
