
#ifdef GL_ES
  precision mediump float;
#endif

varying float fogIntensity;


void main() {
  // 5000.0 is an empirically-determined factor specific to OSMBuildings
  float depth = (gl_FragCoord.z / gl_FragCoord.w)/5000.0;
  if (depth > 1.0)
    depth = 1.0;
    
  float z = floor(depth*256.0)/256.0;
  depth = (depth - z) * 256.0;
  float z1 = floor(depth*256.0)/256.0;
  depth = (depth - z) * 256.0;
  float z2 = floor(depth*256.0)/256.0;

  // option 1: this line outputs high-precision (24bit) depth values
  gl_FragColor = vec4(z, z1, z2, fogIntensity);
  
  // option 2: this line outputs human-interpretable depth values, but with low precision
  //gl_FragColor = vec4(z, z, z, 1.0); 

}
