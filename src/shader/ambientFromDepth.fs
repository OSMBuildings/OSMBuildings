#ifdef GL_ES
  // we need high precision for the depth values
  precision highp float;
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

void main() {

  float depthHere = getDepth(vTexCoord.st, 0, 0);
  if (depthHere == 0.0)
  {
	//there was nothing rendered 'here' --> it can't be occluded
    gl_FragColor = vec4( vec3(1.0), 1.0);
    return;
  }
  
  float occlusionFactor = 1.0;
  for (int x = -3; x <= 3; x++)
    for (int y = -3; y <= 3; y++)
    {
      if (x == 0 && y == 0)
        continue;
      float localOcclusion = getOcclusionFactor(depthHere, vTexCoord.st,  x,  y);
      //float dist = sqrt( float(x*x + y*y) );
      occlusionFactor *= localOcclusion;//pow(localOcclusion, 1.0/*/dist*/);
    }

  gl_FragColor = vec4( vec3(occlusionFactor) , 1.0);
}

