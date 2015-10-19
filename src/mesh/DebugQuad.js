
mesh.DebugQuad = (function() {

  function constructor(options) {
    options = options || {};

    this.id = options.id;
    /*if (options.color) {
      this.color = new Color(options.color).toArray();
    }*/

    this.v1 = this.v2 = this.v3 = this.v4 = [false, false, false];
    this.updateGeometry( [0,0,0], [0,0,0], [0,0,0], [0,0,0]);

    this.minZoom = APP.minZoom;
    this.maxZoom = APP.maxZoom;
  }

  function areEqual(a, b) {
    return a[0] === b[0] &&
           a[1] === b[1] &&
           a[2] === b[2];
  }

  constructor.prototype = {

    updateGeometry: function(v1, v2, v3, v4) {
      if ( areEqual(v1, this.v1) &&
           areEqual(v2, this.v2) &&
           areEqual(v3, this.v3) &&
           areEqual(v4, this.v4))
         return; //still up-to-date

      this.v1 = v1;
      this.v2 = v2;
      this.v3 = v3;
      this.v4 = v4;
      
      if (this.vertexBuffer)
        this.vertexBuffer.destroy();

      var vertices = [].concat(v1, v2, v3, v1, v3, v4);
      this.vertexBuffer = new glx.Buffer(3, new Float32Array(vertices));

      /*
      this.dummyMapPlaneTexCoords = new glx.Buffer(2, new Float32Array([
        0.0, 0.0,
          1, 0.0,
          1,   1,
        
        0.0, 0.0,
          1,   1,
        0.0,   1]));*/

      if (this.normalBuffer)
        this.normalBuffer.destroy();
        
      this.normalBuffer = new glx.Buffer(3, new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        
        0, 0, 1,
        0, 0, 1,
        0, 0, 1]));
      
      var color = [1, 0.5, 0.25];
      if (this.colorBuffer)
        this.colorBuffer.destroy();
        
      this.colorBuffer = new glx.Buffer(3, new Float32Array(
        [].concat(color, color, color, color, color, color)));


      if (this.idBuffer)
        this.idBuffer.destroy();

      this.idBuffer = new glx.Buffer(3, new Float32Array(
        [].concat(color, color, color, color, color, color)));
        
      //this.numDummyVertices = 6;

      this.isReady = true;
    },

    // TODO: switch to mesh.transform
    getMatrix: function() {
      //var scale = render.fogRadius/this.radius;
      var modelMatrix = new glx.Matrix();
      //modelMatrix.scale(scale, scale, scale);
    
      return modelMatrix;
    },

    destroy: function() {

      this.items = null;

      if (this.isReady) {
        this.vertexBuffer.destroy();
        this.normalBuffer.destroy();
        //this.colorBuffer.destroy();
        //this.idBuffer.destroy();
      }
    }
  };

  return constructor;

}());
