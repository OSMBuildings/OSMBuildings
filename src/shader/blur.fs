#ifdef GL_ES
  precision mediump float;
#endif

uniform sampler2D uTexIndex;
uniform float uInverseTexWidth;   //in 1/pixels, e.g. 1/512 if the texture is 512px wide
uniform float uInverseTexHeight;  //in 1/pixels

varying vec2 vTexCoord;

/* Retrieves the texel color at (dx, dy) pixels away from 'pos' from texture 'uTexIndex'. */
vec4 getTexel(vec2 pos, int dx, int dy)
{
  //retrieve the color-coded depth
  return texture2D(uTexIndex, vec2(pos.s + float(dx) * uInverseTexWidth, 
                                   pos.t + float(dy) * uInverseTexHeight));
}


void main() {

  vec4 center = texture2D(uTexIndex, vTexCoord);
  vec4 nonDiagonalNeighbors = getTexel(vTexCoord, -1, 0) +
                              getTexel(vTexCoord, +1, 0) +
                              getTexel(vTexCoord,  0,-1) +
                              getTexel(vTexCoord,  0,+1);

  vec4 diagonalNeighbors =    getTexel(vTexCoord, -1,-1) +
                              getTexel(vTexCoord, +1,+1) +
                              getTexel(vTexCoord, -1,+1) +
                              getTexel(vTexCoord, +1,-1);  

  
  //approximate Gaussian blur (mean 0.0, stdev 1.0)
  gl_FragColor = 0.2/1.0 * center + 
                 0.5/4.0 * nonDiagonalNeighbors + 
                 0.3/4.0 * diagonalNeighbors;
}

