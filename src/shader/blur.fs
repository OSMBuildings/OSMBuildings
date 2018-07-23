#ifdef GL_ES
  precision mediump float;
#endif

uniform sampler2D uTexIndex;
uniform vec2 uInverseTexSize; // as 1/n pixels, e.g. 1/512 if the texture is 512px wide

varying vec2 vTexCoord;

// Retrieves the texel color 'offset' pixels away from 'pos' from texture 'uTexIndex'.
vec4 getTexel(vec2 pos, vec2 offset) {
  return texture2D(uTexIndex, pos + offset * uInverseTexSize);
}

void main() {
  vec4 center = texture2D(uTexIndex, vTexCoord);
  vec4 nonDiagonalNeighbors = getTexel(vTexCoord, vec2(-1.0,  0.0)) +
                              getTexel(vTexCoord, vec2(+1.0,  0.0)) +
                              getTexel(vTexCoord, vec2( 0.0, -1.0)) +
                              getTexel(vTexCoord, vec2( 0.0, +1.0));

  vec4 diagonalNeighbors =    getTexel(vTexCoord, vec2(-1.0, -1.0)) +
                              getTexel(vTexCoord, vec2(+1.0, +1.0)) +
                              getTexel(vTexCoord, vec2(-1.0, +1.0)) +
                              getTexel(vTexCoord, vec2(+1.0, -1.0));
  
  // approximate Gaussian blur (mean 0.0, stdev 1.0)

  gl_FragColor = 0.2/1.0 * center +
                 0.5/4.0 * nonDiagonalNeighbors + 
                 0.3/4.0 * diagonalNeighbors;
}

