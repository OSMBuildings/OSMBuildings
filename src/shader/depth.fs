#ifdef GL_ES
  precision mediump float;
#endif

varying vec4 vPosition;

void main() {
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float z = depth/1500.0;//gl_FragCoord.z;
  float z1 = fract(z*255.0);
  float z2 = fract(z1*255.0);
  float z3 = fract(z2*255.0);

  /* The following biasing is necessary for shadow mapping to work correctly.
   * Source: http://forum.devmaster.net/t/shader-effects-shadow-mapping/3002
   * This might be due to the GPU *rounding* the float values to the nearest uint8_t 
   * instead of *truncating* as would be expected in C/C++ */
  z  -= 1.0/255.0*z1;
  z1 -= 1.0/255.0*z2;
  z2 -= 1.0/255.0*z3;
  
  // option 1: this line outputs high-precision (24bit) depth values
  gl_FragColor = vec4(z, z1, z2, z3);
  
  // option 2: this line outputs human-interpretable depth values, but with low precision
  //gl_FragColor = vec4(z, z, z, 1.0); 

}
