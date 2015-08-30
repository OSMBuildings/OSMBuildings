#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 aPosition;

uniform mat4 uMatrix;

varying vec4 vPosition;

void main() {
//  if (aHidden == 1.0) {
//    gl_Position = vec4(0.0);
//    vPosition = vec4(0.0);
//  }
  gl_Position = uMatrix * aPosition;
  vPosition = aPosition;
}
