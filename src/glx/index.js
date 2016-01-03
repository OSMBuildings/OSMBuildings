
//var ext = GL.getExtension('WEBGL_lose_context');
//ext.loseContext();

var GLX = function(container, width, height, highQuality) {
  var canvas = document.createElement('CANVAS');
  canvas.style.position = 'absolute';
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  var options = {
    antialias: highQuality,
    depth: true,
    premultipliedAlpha: false
  };

  var context;

  try {
    context = canvas.getContext('webgl', options);
  } catch (ex) {}
  if (!context) {
    try {
      context = canvas.getContext('experimental-webgl', options);
    } catch (ex) {}
  }
  if (!context) {
    throw new Error('WebGL not supported');
  }

  canvas.addEventListener('webglcontextlost', function(e) {
    console.warn('context lost');
  });

  canvas.addEventListener('webglcontextrestored', function(e) {
    console.warn('context restored');
  });

  context.viewport(0, 0, width, height);
  context.cullFace(context.BACK);
  context.enable(context.CULL_FACE);
  context.enable(context.DEPTH_TEST);
  context.clearColor(0.5, 0.5, 0.5, 1);

  if (highQuality) {
    context.anisotropyExtension = context.getExtension('EXT_texture_filter_anisotropic');
    if (context.anisotropyExtension) {
      context.anisotropyExtension.maxAnisotropyLevel = context.getParameter(
        context.anisotropyExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT
      );
    }
  }

  return GLX.use(context);
};
