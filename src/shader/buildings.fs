#ifdef GL_ES
  precision mediump float;
#endif

varying vec3 vColor;
varying vec2 vTexCoord;
varying float verticalDistanceToLowerEdge;

uniform vec3 uFogColor;
uniform float uFogDistance;
uniform float uFogBlurDistance;
uniform sampler2D uWallTexIndex;

void main() {
    
  float fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;
  fogIntensity = clamp(fogIntensity, 0.0, 1.0);

  gl_FragColor = vec4(vColor * texture2D(uWallTexIndex, vTexCoord).rgb, 1.0-fogIntensity);
}
