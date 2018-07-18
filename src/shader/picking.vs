precision highp float; // is default in vertex shaders anyway, using highp fixes #49

attribute vec4 aPosition;
attribute vec3 aPickingColor;
attribute float aZScale;

uniform mat4 uModelMatrix;
uniform mat4 uMatrix;

uniform float uFogDistance;
uniform float uFade;
uniform float uIndex;

varying vec4 vColor;

void main() {

  float f = clamp(uFade*aZScale, 0.0, 1.0);

  if (f == 0.0) {
    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
    vColor = vec4(0.0, 0.0, 0.0, 0.0);
  } else {
    vec4 pos = vec4(aPosition.x, aPosition.y, aPosition.z*f, aPosition.w);
    gl_Position = uMatrix * pos;

    vec4 mPosition = vec4(uModelMatrix * pos);
    float distance = length(mPosition);

    if (distance > uFogDistance) {
      vColor = vec4(0.0, 0.0, 0.0, 0.0);
    } else {
      vColor = vec4(clamp(uIndex, 0.0, 1.0), aPickingColor.g, aPickingColor.b, 1.0);
    }
  }
}
