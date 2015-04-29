
precision mediump float;

uniform sampler2D uTileImage;

varying vec2 vTexCoord;

void main() {
  gl_FragColor = texture2D(uTileImage, vec2(vTexCoord.x, -vTexCoord.y));
}
