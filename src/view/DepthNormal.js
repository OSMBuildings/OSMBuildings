
// Renders the depth buffer and normals into textures.
// Depth is stored as a 24bit depth texture using the WEBGL_depth_texture extension,
// and normals are stored as the 'rgb' and 'a' of a shared 32bit texture.
// Note that there is no dedicated shader to create the depth texture. Rather,
// the depth buffer used by the GPU in depth testing while rendering the normals
// to a dedicated texture.

View.DepthNormal = class {

  constructor () {
    this.shader = new GLX.Shader({
      source: shaders.depth_normal,
      attributes: ['aPosition', 'aNormal', 'aZScale'],
      uniforms: ['uMatrix', 'uModelMatrix', 'uNormalMatrix', 'uFade', 'uFogDistance', 'uFogBlurDistance', 'uViewDirOnMap', 'uLowerEdgePoint']
    });

    this.framebuffer = new GLX.Framebuffer(128, 128, /*depthTexture=*/true); // dummy sizes, will be resized dynamically
    this.mapPlane = new MapPlane();
  }

  render (viewMatrix, projMatrix, framebufferSize) {
    const
      shader = this.shader,
      framebuffer = this.framebuffer,
      viewProjMatrix = new GLX.Matrix(GLX.Matrix.multiply(viewMatrix, projMatrix));

    framebuffer.setSize(framebufferSize[0], framebufferSize[1]);

    shader.enable();
    framebuffer.enable();

    GL.viewport(0, 0, framebufferSize[0], framebufferSize[1]);

    GL.clearColor(0.0, 0.0, 0.0, 1);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    shader.setParam('uViewDirOnMap', '2fv', APP.view.viewDirOnMap);
    shader.setParam('uLowerEdgePoint', '2fv', APP.view.lowerLeftOnMap);
    shader.setParam('uFogDistance', '1f', APP.view.fogDistance);
    shader.setParam('uFogBlurDistance', '1f', APP.view.fogBlurDistance);

    // render all data items, but also a dummy map plane
    // Note: SSAO on the map plane has been disabled temporarily TODO: check

    const features = APP.features.items.concat([this.mapPlane]);

    features.forEach(item => {
      if (APP.zoom < item.minZoom || APP.zoom > item.maxZoom) {
        return;
      }

      const modelMatrix = item.getMatrix();

      if (!modelMatrix) {
        return;
      }

      shader.setParam('uFade', '1f', item.getFade());

      shader.setMatrix('uMatrix', '4fv', GLX.Matrix.multiply(modelMatrix, viewProjMatrix));
      shader.setMatrix('uModelMatrix', '4fv', modelMatrix.data);
      shader.setMatrix('uNormalMatrix', '3fv', GLX.Matrix.transpose3(GLX.Matrix.invert3(GLX.Matrix.multiply(modelMatrix, viewMatrix))));

      shader.setBuffer('aPosition', item.vertexBuffer);
      shader.setBuffer('aNormal', item.normalBuffer);
      shader.setBuffer('aZScale', item.zScaleBuffer);

      GL.drawArrays(GL.TRIANGLES, 0, item.vertexBuffer.numItems);
    });

    shader.disable();
    framebuffer.disable();

    GL.viewport(0, 0, APP.width, APP.height);
  }

  destroy () {
    this.shader.destroy();
    this.framebuffer.destroy();
    this.mapPlane.destroy();
  }
};
