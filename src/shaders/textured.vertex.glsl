#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uMatrix;

varying vec2 vTexCoord;

void main() {
  gl_Position = uMatrix * aPosition;
  vTexCoord = aTexCoord;
}
