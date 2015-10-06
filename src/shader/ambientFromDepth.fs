#ifdef GL_ES
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
  return codedDepth.x + codedDepth.y/255.0 + codedDepth.z/(255.0*255.0);
}


/* getOcclusionFactor() determines a heuristic factor for how much the fragment at 'pos' 
 * with depth 'depthHere'is occluded by the fragment that is (dx, dy) texels away from it.
 * 
 * The heuristic is as follows:
 * - if the fragment at (dx, dy) has no depth (i.e. there was nothing rendered there), then
 *   'here' is not occluded (result 1.0)
 * - if the fragment at (dx, dy) is further away from the viewer than 'here', then
 *   'here is not occluded'
 * - if the fragment at (dx, dy) is closer to the viewer than 'here', then it occluded
 *   'here' the higher the depth difference between the two locations is.
*/
float getOcclusionFactor(float depthHere, vec2 pos, int dx, int dy)
{
    float depthThere = getDepth(pos, dx, dy);
    if (depthThere == 0.0)
        return 1.0;
    
    return depthHere < depthThere ? 1.0 : /*0.99;//*/ depthThere / depthHere;
}

void main() {

  float depthHere = getDepth(vTexCoord.st, 0, 0);
  if (depthHere == 0.0)
  {
    gl_FragColor = vec4( vec3(0.0), 1.0);
    return;
  }
  
  float occlusionFactor = 1.0;
  for (int x = -3; x <= 3; x++)
    for (int y = -3; y <= 3; y++)
        occlusionFactor *= getOcclusionFactor(depthHere, vTexCoord.st,  x,  y);

  gl_FragColor = vec4( vec3(occlusionFactor) , 1.0);
}

