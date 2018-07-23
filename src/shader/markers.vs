precision highp float; // is default in vertex shaders anyway, using highp fixes #49

attribute vec4 aPosition;

uniform mat4 uProjMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform vec3 uColor;

uniform mat4 uSunMatrix;
uniform vec2 uViewDirOnMap;
uniform vec2 uLowerEdgePoint;

varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vSunRelPosition;
varying float verticalDistanceToLowerEdge;


// TODO: fog distance handling is missing here

void main() {

    mat4 modelView = uViewMatrix * uModelMatrix;

    modelView[0][0] = 1.0;
    modelView[0][1] = 0.0;
    modelView[0][2] = 0.0;

    modelView[1][0] = 0.0;
    modelView[1][1] = 1.0;
    modelView[1][2] = 0.0;

    modelView[2][0] = 0.0;
    modelView[2][1] = 0.0;
    modelView[2][2] = 1.0;

    mat4 mvp = uProjMatrix * modelView;

    float reciprScaleOnscreen = 0.02;
    float w = (mvp * vec4(0,0,0,1)).w;
    w *= reciprScaleOnscreen;

    vec4 pos = vec4((aPosition.x * w), (aPosition.y * w) , aPosition.z * w, 1);

    gl_Position = mvp * pos;

    vColor = uColor;

    vec4 worldPos = uModelMatrix * pos;
    vec2 dirFromLowerEdge = worldPos.xy / worldPos.w - uLowerEdgePoint;
    verticalDistanceToLowerEdge = dot(dirFromLowerEdge, uViewDirOnMap);

    // *** shadow mapping ********

    vec4 sunRelPosition = uSunMatrix * pos;
    vSunRelPosition = (sunRelPosition.xyz / sunRelPosition.w + 1.0) / 2.0;
}
