#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vSunRelPosition;
varying float verticalDistanceToLowerEdge;

uniform vec3 uFogColor;
uniform vec2 uShadowTexDimensions;
uniform sampler2D uShadowTexIndex;

uniform float uFogDistance;
uniform float uFogBlurDistance;
uniform float uShadowStrength;

uniform vec3 uLightDirection;
uniform vec3 uLightColor;

float isSeenBySun(const vec2 sunViewNDC, const float depth, const float bias) {
  if ( clamp( sunViewNDC, 0.0, 1.0) != sunViewNDC) // not inside sun's viewport
    return 1.0;
  
  float depthFromTexture = texture2D( uShadowTexIndex, sunViewNDC.xy).x;
  
  // compare depth values not in reciprocal but in linear depth
  return step(1.0/depthFromTexture, 1.0/depth + bias);
}

void main() {

  vec3 normal = normalize(vec3(0.0, -1.0, 0.0)); //may degenerate during per-pixel interpolation

  float diffuse = dot(uLightDirection, normal);
  diffuse = max(diffuse, 0.0);

  // reduce shadow strength with:
  // - lowering sun positions, to be consistent with the shadows on the basemap (there,
  //   shadows are faded out with lowering sun positions to hide shadow artifacts caused
  //   when sun direction and map surface are almost perpendicular
  // - large angles between the sun direction and the surface normal, to hide shadow
  //   artifacts that occur when surface normal and sun direction are almost perpendicular
  float shadowStrength = pow( max( min(
    dot(uLightDirection, vec3(0.0, 0.0, 1.0)),
    dot(uLightDirection, normal)
  ), 0.0), 1.5);

  if (diffuse > 0.0 && shadowStrength > 0.0) {
    // note: the diffuse term is also the cosine between the surface normal and the
    // light direction
    float bias = clamp(0.0007*tan(acos(diffuse)), 0.0, 0.01);
    vec2 pos = fract( vSunRelPosition.xy * uShadowTexDimensions);
    
    vec2 tl = floor(vSunRelPosition.xy * uShadowTexDimensions) / uShadowTexDimensions;
    float tlVal = isSeenBySun( tl,                           vSunRelPosition.z, bias);
    float trVal = isSeenBySun( tl + vec2(1.0, 0.0) / uShadowTexDimensions, vSunRelPosition.z, bias);
    float blVal = isSeenBySun( tl + vec2(0.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);
    float brVal = isSeenBySun( tl + vec2(1.0, 1.0) / uShadowTexDimensions, vSunRelPosition.z, bias);

    float occludedBySun = mix( 
                            mix(tlVal, trVal, pos.x), 
                            mix(blVal, brVal, pos.x),
                            pos.y);
    diffuse *= 1.0 - (shadowStrength * (1.0 - occludedBySun));
  }

  vec3 color = vColor + (diffuse/1.5) * uLightColor;

  float fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;
  fogIntensity = clamp(fogIntensity, 0.0, 1.0);

  gl_FragColor = vec4( color, 1.0-fogIntensity);
}
