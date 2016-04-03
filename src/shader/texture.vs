precision highp float;  //is default in vertex shaders anyway, using highp fixes #49

attribute vec4 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uMatrix;

varying vec2 vTexCoord;

void main() {
  gl_Position = uMatrix * aPosition;
  vTexCoord = aTexCoord;
}
