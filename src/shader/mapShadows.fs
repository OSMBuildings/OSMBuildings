#ifdef GL_ES
  precision mediump float;
#endif

//uniform sampler2D uTexIndex;
uniform sampler2D uShadowTexIndex;
uniform vec3 uFogColor;
uniform vec3 uDirToSun;
uniform vec2 uShadowTexDimensions;
uniform float uShadowStrength;


varying vec2 vTexCoord;
varying vec3 vSunRelPosition;
varying vec3 vNormal;
varying float verticalDistanceToLowerEdge;

uniform float uFogDistance;
uniform float uFogBlurDistance;

float isSeenBySun( const vec2 sunViewNDC, const float depth, const float bias) {
  if ( clamp( sunViewNDC, 0.0, 1.0) != sunViewNDC)  //not inside sun's viewport
    return 1.0;
  
  vec4 depthTexel = texture2D( uShadowTexIndex, sunViewNDC.xy);
  
  float depthFromTexture = depthTexel.x + 
                          (depthTexel.y / 255.0) + 
                          (depthTexel.z / (255.0 * 255.0));

  //compare depth values not in reciprocal but in linear depth
  return step( 1.0/depthFromTexture, 1.0/depth + bias);
}

void main() {


  float diffuse = dot(uDirToSun, normalize(vNormal));
  diffuse = max( diffuse, 0.0);

  if (diffuse > 0.0)
  {
    // note: the diffuse term is also the cosine between the surface normal and the
    // light direction
    float bias = clamp(0.0007*tan(acos(diffuse)), 0.0, 0.01);
    
    vec2 pos = fract( vSunRelPosition.xy * uShadowTexDimensions);
    
    vec2 tl = floor(vSunRelPosition.xy * uShadowTexDimensions) / uShadowTexDimensions;
    float tlVal = isSeenBySun( tl,                           vSunRelPosition.z, bias);
    float trVal = isSeenBySun( tl + vec2(1.0, 0.0) / uShadowTexDimensions, vSunRelPosition.z, bias);
    float blVal = isSeenBySun( tl + vec2(0.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);
    float brVal = isSeenBySun( tl + vec2(1.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);

    diffuse = mix( mix(tlVal, trVal, pos.x), 
                   mix(blVal, brVal, pos.x),
                   pos.y);
  }

  float fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;
  fogIntensity = clamp(fogIntensity, 0.0, 1.0);

  float darkness = (1.0 - diffuse);
  darkness *= uShadowStrength * (1.0 - fogIntensity);
  gl_FragColor = vec4(vec3(1.0 - darkness), 1.0);

}
