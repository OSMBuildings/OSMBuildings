#ifdef GL_FRAGMENT_PRECISION_HIGH
  // we need high precision for the depth values
  precision highp float;
#else
  precision mediump float;
#endif

uniform sampler2D uTexIndex;
uniform float uInverseTexWidth;   //in 1/pixels, e.g. 1/512 if the texture is 512px wide
uniform float uInverseTexHeight;  //in 1/pixels

varying vec2 vTexCoord;

/* Retrieves the depth value (dx, dy) pixels away from 'pos' from texture 'uTexIndex'. */
float getDepth(vec2 pos, int dx, int dy)
{
  //retrieve the color-coded depth
  vec4 codedDepth = texture2D(uTexIndex, vec2(pos.s + float(dx) * uInverseTexWidth, 
                                              pos.t + float(dy) * uInverseTexHeight));
  //convert back to depth value
  return codedDepth.x + 
         codedDepth.y/ 256.0 + 
         codedDepth.z/(256.0*256.0) +
         codedDepth.w/(256.0*256.0*256.0);
}


/* getOcclusionFactor() determines a heuristic factor (from [0..1]) for how 
 * much the fragment at 'pos' with depth 'depthHere'is occluded by the 
 * fragment that is (dx, dy) texels away from it.
 */
float getOcclusionFactor(float depthHere, vec2 pos, int dx, int dy)
{
    float depthThere = getDepth(pos, dx, dy);
    /* if the fragment at (dx, dy) has no depth (i.e. there was nothing rendered there), 
     * then 'here' is not occluded (result 1.0) */
    if (depthThere == 0.0)
      return 1.0;

    /* if the fragment at (dx, dy) is further away from the viewer than 'here', then
     * 'here is not occluded' */
    if (depthHere < depthThere )
      return 1.0;
      
    float relDepthDiff = depthThere / depthHere;

    /* if the fragment at (dx, dy) is closer to the viewer than 'here', then it occludes
     * 'here'. The occlusion is the higher the bigger the depth difference between the two
     * locations is.
     * However, if the depth difference is too high, we assume that 'there' lies in a
     * completely different depth region of the scene than 'here' and thus cannot occlude
     * 'here'. This last assumption gets rid of very dark artifacts around tall buildings.
     */
    return relDepthDiff > 0.95 ? relDepthDiff : 1.0;
}

/* This shader approximates the ambient occlusion in screen space (SSAO). 
 * It is based on the assumption that a pixel will be occluded by neighboring 
 * pixels iff. those have a depth value closer to the camera than the original
 * pixel itself (the function getOcclusionFactor() computes this occlusion 
 * by a single other pixel).
 *
 * A naive approach would sample all pixels within a given distance. For an
 * interesting-looking effect, the sampling area needs to be at least 9 pixels 
 * wide (-/+ 4), requiring 81 texture lookups per pixel for ambient occlusion.
 * This overburdens many GPUs.
 * To make the ambient occlusion computation faster, we employ the following 
 * tricks:
 * 1. We do not consider all texels in the sampling area, but only a select few 
 *    (at most 16). This causes some sampling artifacts, which are later
 *    removed by blurring the ambient occlusion texture (this is done in a
 *    separate shader).
 * 2. The further away an object is the fewer samples are considered and the
 *    closer are these samples to the texel for which the ambient occlusion is
 *    being computed. The rationale is that ambient occlusion attempts to de-
 *    determine occlusion by *nearby* other objects. Due to the perspective 
 *    projection, the further away objects are, the smaller they become. 
 *    So the further away objects are, the closer are those nearby other objects
 *    in screen-space, and thus texels further away no longer need to be 
 *    considered.
 *    As a positive side-effect, this also reduces the total number of texels 
 *    that need to be sampled.
 */
void main() {

  float depthHere = getDepth(vTexCoord.st, 0, 0);
  if (depthHere == 0.0)
  {
	//there was nothing rendered 'here' --> it can't be occluded
    gl_FragColor = vec4( vec3(1.0), 1.0);
    return;
  }
  
  float occlusionFactor = 1.0;
  
  //always consider the direct horizontal and vertical neighbors for the ambient map 
  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  -1,   0);
  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  +1,   0);
  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,   0,  -1);
  occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,   0,  +1);
  /* note: exponents are hand-tuned to give about the same brightness no matter
   *       how many samples are considered (4, 8 or 16) */
  float exponent = 60.0;  
  
  if (depthHere < 0.4)
  {
    /* for closer objects, also consider the texels that are two pixels 
     * away diagonally. */
    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  -2,  -2);
    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  +2,  +2);
    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  +2,  -2);
    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  -2,  +2);
    exponent = 12.0;
  }
    
  if (depthHere < 0.3)
  {
    /* for the closest objects, also consider the texels that are four pixels 
     * away horizontally, vertically and diagonally */
    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  -4,   0);
    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  +4,   0);
    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,   0,  -4);
    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,   0,  +4);

    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  -4,  -4);
    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  +4,  +4);
    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  +4,  -4);
    occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  -4,  +4);
    exponent = 4.0;
  }

  gl_FragColor = vec4( vec3(pow(occlusionFactor, 1.0 *exponent)) , 1.0);
}

