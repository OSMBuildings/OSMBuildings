#ifdef GL_ES
  precision mediump float;
#endif

//uniform sampler2D uTexIndex;
uniform sampler2D uShadowTexIndex;
uniform vec3 uFogColor;
uniform float uInverseTexWidth;   //in 1/pixels, e.g. 1/512 if the texture is 512px wide
uniform float uInverseTexHeight;  //in 1/pixels


varying vec2 vTexCoord;
varying vec3 vSunRelPosition;
varying float verticalDistanceToLowerEdge;

uniform float uFogDistance;
uniform float uFogBlurDistance;

float isSeenBySun( const vec2 sunViewNDC, const float depth) {
  bool inSunView = clamp( sunViewNDC, 0.0, 1.0) == sunViewNDC;

  vec4 depthTexel = texture2D( uShadowTexIndex, sunViewNDC.xy);
  
  float depthFromTexture = depthTexel.x + 
                          (depthTexel.y / 255.0) + 
                          (depthTexel.z / (255.0 * 255.0));

  return !inSunView || (depth - depthFromTexture < 2E-5) ? 1.0 : 0.0;
}

void main() {
/*
  float fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;
  fogIntensity = clamp(fogIntensity, 0.0, 1.0);*/

  vec2 texDim = vec2( uInverseTexWidth, uInverseTexHeight);

  vec2 pos = fract( vSunRelPosition.xy * texDim);
  //vec2( fract(vSunRelPosition.s*uInverseTexWidth) / uInverseTexWidth,
  //                 fract(vSunRelPosition.t*uInverseTexHeight) / uInverseTexHeight);

  //gl_FragColor = vec4( texDim, 0.0, 1.0);
  //return;
  //vec4( vSunRelPosition.xy, 0.0, 1.0);
  //return;
  
  vec2 tl = floor(vSunRelPosition.xy * texDim) / texDim;
  float tlVal = isSeenBySun( tl, vSunRelPosition.z);
  float trVal = isSeenBySun( tl + vec2(1.0, 0.0) / texDim, vSunRelPosition.z);
  float blVal = isSeenBySun( tl + vec2(0.0, 1.0) / texDim, vSunRelPosition.z);
  float brVal = isSeenBySun( tl + vec2(1.0, 1.0) / texDim, vSunRelPosition.z);
  
  
  
  float brightness = (tlVal * (1.0-pos.x) + trVal * pos.x) * (1.0 - pos.y) + 
                     (blVal * (1.0-pos.x) + brVal * pos.x) * (      pos.y);
//  vec2   
  
  /*
  bool inSunView = vSunRelPosition.x >= 0.0 && vSunRelPosition.x <= 1.0 &&
                   vSunRelPosition.y >= 0.0 && vSunRelPosition.y <= 1.0;

  vec4 depthTexel = texture2D( uShadowTexIndex, vSunRelPosition.xy);
  
  float depthActual = vSunRelPosition.z;
  float depthFromTexture = depthTexel.x + 
                          (depthTexel.y / 255.0) + 
                          (depthTexel.z / (255.0 * 255.0));
  
  
  int numInSun = 
 
  float brightness = inSunView && (depthActual - depthFromTexture < 1E-5) ? 1.0 : 0.1;*/
  /*float brightness = 0.0;
  for (int x = -1; x <= 1; x++)
    for (int y = -1; y <= 1; y++)
      brightness += isSeenBySun( vec3( 
        vSunRelPosition.x + float(x)/uInverseTexWidth,
        vSunRelPosition.y + float(y)/uInverseTexHeight,
        vSunRelPosition.z));
  //float brightness = isSeenBySun( vSunRelPosition);
  //brightness += isSeenBySun( vec3( vSunRelPosition.xy + 1.0/512.0, vSunRelPosition.z));
  
  brightness /= 9.0;*/
  brightness = (brightness + 1.0) / 2.0;
  gl_FragColor = vec4( vec3(brightness), 1.0);

  
  //vec3 color = vec3(texture2D(uTexIndex, vTexCoord));
  //gl_FragColor = vec4(mix(color, uFogColor, fogIntensity), 1.0);
  //gl_FragColor = vec4( vTexCoord.x, 0.0, 0.0, 1.0);
}
