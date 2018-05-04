precision highp float; // is default in vertex shaders anyway, using highp fixes #49

attribute vec4 aPosition;
uniform mat4 uMatrix;
uniform mat4 uViewMatrix;

void main() {
  // gl_Position = uMatrix * aPosition;

  vec3 cameraRight = vec3(uViewMatrix[0].x, uViewMatrix[1].x, uViewMatrix[2].x);
  vec3 cameraUp = vec3(uViewMatrix[0].y, uViewMatrix[1].y, uViewMatrix[2].y);

  vec4 pos = aPosition;

  // pos.xyz += (cameraRight * aTriCorner.x * size) + (cameraUp * aTriCorner.y * size);
  pos.xyz += (cameraRight * 110.0) + (cameraUp * 110.0);

  gl_Position = uMatrix * pos;
}
