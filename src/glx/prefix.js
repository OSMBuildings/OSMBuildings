GLX.use = function(context) {

  return (function(GL) {

    var glx = {};

    glx.context = context;

    glx.start = function(render) {
      return setInterval(function() {
        requestAnimationFrame(render);
      }, 17);
    };

    glx.stop = function(loop) {
      clearInterval(loop);
    };

    glx.destroy = function() {
      context.canvas.parentNode.removeChild(context.canvas);
      context = null;
    };
