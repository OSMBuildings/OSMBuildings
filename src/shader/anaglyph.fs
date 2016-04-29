#ifdef GL_ES
  precision mediump float;
#endif

uniform sampler2D uTexLeftIndex;
uniform sampler2D uTexRightIndex;

varying vec2 vTexCoord;

void main() {

  //Y = 0.299 R + 0.587 G + 0.114 B
  vec4 left = texture2D(uTexLeftIndex,   vTexCoord.st + vec2(0.01, 0.0));
  vec4 right = texture2D(uTexRightIndex, vTexCoord.st - vec2(0.01, 0.0));
  
  float leftGreenBlueBrightness = (left.g * 0.587 + left.b * 0.114) / (0.587 + 0.114);
  
  
  gl_FragColor = vec4( leftGreenBlueBrightness, right.g, right.b, 1.0);
  //vec4( vec3(1.0, 0.0, 1.0), 1.0);
}
