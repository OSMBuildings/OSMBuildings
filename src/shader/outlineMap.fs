#ifdef GL_FRAGMENT_PRECISION_HIGH
  // we need high precision for the depth values
  precision highp float;
#else
  precision mediump float;
#endif

uniform sampler2D uDepthTexIndex;
uniform sampler2D uFogNormalTexIndex;
uniform vec2 uInverseTexSize;   //in 1/pixels, e.g. 1/512 if the texture is 512px wide
uniform float uEffectStrength;
uniform float uNearPlane;
uniform float uFarPlane;

varying vec2 vTexCoord;

/* Retrieves the depth value 'offset' pixels away from 'pos' from texture 'uDepthTexIndex'. */
float getDepth(vec2 pos, vec2 offset)
{
  float z = texture2D(uDepthTexIndex, pos + offset * uInverseTexSize).x;
  return (2.0 * uNearPlane) / (uFarPlane + uNearPlane - z * (uFarPlane - uNearPlane)); // linearize depth
}

vec3 getNormal(vec2 pos, vec2 offset)
{
  return normalize(texture2D(uFogNormalTexIndex, pos + offset * uInverseTexSize).xyz * 2.0 - 1.0);
}

void main() {
  float fogIntensity = texture2D(uFogNormalTexIndex, vTexCoord.st).w;

  vec3 normalHere =  getNormal(vTexCoord.st, vec2(0, 0));
  vec3 normalRight = getNormal(vTexCoord.st, vec2(1, 0));
  vec3 normalAbove = getNormal(vTexCoord.st, vec2(0,-1));
  
  float edgeStrengthFromNormal = 
    step( dot(normalHere, normalRight), 0.9) +
    step( dot(normalHere, normalAbove), 0.9);

  float depthHere =  getDepth(vTexCoord.st, vec2(0,  0));
  float depthRight = getDepth(vTexCoord.st, vec2(1,  0));
  float depthAbove = getDepth(vTexCoord.st, vec2(0, -1));

  float depthDiffRight = abs(depthHere - depthRight) * 7500.0;
  float depthDiffAbove = abs(depthHere - depthAbove) * 7500.0;

  float edgeStrengthFromDepth = step(10.0, depthDiffRight) + 
                                step(10.0, depthDiffAbove);
  
  float edgeStrength = max( edgeStrengthFromNormal, edgeStrengthFromDepth);
   edgeStrength *= 0.5;

  float occlusionFactor = 1.0 - (edgeStrength * uEffectStrength);
  occlusionFactor = 1.0 - ((1.0- occlusionFactor) * (1.0-fogIntensity));
  gl_FragColor = vec4(vec3(occlusionFactor), 1.0);
}

