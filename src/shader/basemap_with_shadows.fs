
#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

/* This shader computes the diffuse brightness of the map layer. It does *not* 
 * render the map texture itself, but is instead intended to be blended on top
 * of an already rendered map.
 * Note: this shader is not (and does not attempt to) be physically correct.
 *       It is intented to be a blend between a useful illustration of cast
 *       shadows and a mitigation of shadow casting artifacts occuring at
 *       low angles on incidence.
 *       Map brightness is only affected by shadows, not by light direction.
 *       Shadows are darkest when light comes from straight above (and thus
 *       shadows can be computed reliably) and become less and less visible
 *       with the light source close to horizon (where moiré and offset
 *       artifacts would otherwise be visible).
 */

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
  
  float depthFromTexture = texture2D( uShadowTexIndex, sunViewNDC.xy).x;
  
  //compare depth values not in reciprocal but in linear depth
  return step(1.0/depthFromTexture, 1.0/depth + bias);
}

void main() {
  //vec2 tl = floor(vSunRelPosition.xy * uShadowTexDimensions) / uShadowTexDimensions;
  //gl_FragColor = vec4(vec3(texture2D( uShadowTexIndex, tl).x), 1.0);
  //return;
  float diffuse = dot(uDirToSun, normalize(vNormal));
  diffuse = max(diffuse, 0.0);
  
  float shadowStrength = uShadowStrength * pow(diffuse, 1.5);

  if (diffuse > 0.0) {
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

  diffuse = mix(1.0, diffuse, shadowStrength);
  
  float fogIntensity = (verticalDistanceToLowerEdge - uFogDistance) / uFogBlurDistance;
  fogIntensity = clamp(fogIntensity, 0.0, 1.0);

  float darkness = (1.0 - diffuse);
  darkness *=  (1.0 - fogIntensity);
  gl_FragColor = vec4(vec3(1.0 - darkness), 1.0);
}
