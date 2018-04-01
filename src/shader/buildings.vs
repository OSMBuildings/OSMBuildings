precision highp float;  //is default in vertex shaders anyway, using highp fixes #49

#define halfPi 1.57079632679

attribute vec4 aPosition;
attribute vec2 aTexCoord;
attribute vec3 aNormal;
attribute vec3 aColor;
attribute vec3 aId;
attribute float aHeight;

uniform mat4 uModelMatrix;
uniform mat4 uMatrix;

uniform mat3 uNormalTransform;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;

uniform vec3 uHighlightColor;
uniform vec3 uHighlightId;
uniform vec2 uViewDirOnMap;
uniform vec2 uLowerEdgePoint;

uniform float uFade;

varying vec3 vColor;
varying vec2 vTexCoord;
varying float verticalDistanceToLowerEdge;

const float gradientStrength = 0.4;

void main() {

  float f = clamp(uFade, 0.0, 1.0);

  if (f == 0.0) {
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
    vColor = vec3(0.0, 0.0, 0.0);
  } else {

    vec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);
    gl_Position = uMatrix * pos;

    //*** highlight object ******************************************************

    vec3 color = aColor;
    if (uHighlightId == aId) {
      color = mix(aColor, uHighlightColor, 0.5);
    }

    //*** light intensity, defined by light direction on surface ****************

    vec3 transformedNormal = aNormal * uNormalTransform;
    float lightIntensity = max( dot(transformedNormal, uLightDirection), 0.0) / 1.5;
    color = color + uLightColor * lightIntensity;
    vTexCoord = aTexCoord;

    //*** vertical shading ******************************************************

    float verticalShading = clamp(gradientStrength - ((pos.z*gradientStrength) / aHeight), 0.0, gradientStrength);

    //***************************************************************************

    vColor = color-verticalShading;
    vec4 worldPos = uModelMatrix * pos;
    vec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;
    verticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);
  }
}
