
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


  constructor.prototype = {

    updateGeometry: function(v1, v2, v3, v4) {
      if ( equal3(v1, this.v1) &&
           equal3(v2, this.v2) &&
           equal3(v3, this.v3) &&
           equal3(v4, this.v4))
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
        
      this.texCoordBuffer = new glx.Buffer(2, new Float32Array(
        [0,0,0,0,0,0,0,0,0,0,0,0]));
        
      var filter = [0,1,1,1];
      
      this.filterBuffer = new glx.Buffer(4, new Float32Array(
        [].concat(filter, filter, filter, filter, filter, filter)));
        
      //this.numDummyVertices = 6;
    },

    // TODO: switch to a notation like mesh.transform
    getMatrix: function() {
      //var scale = render.fogRadius/this.radius;
      var modelMatrix = new glx.Matrix();
      //modelMatrix.scale(scale, scale, scale);
    
      return modelMatrix;
    },

    destroy: function() {
      this.vertexBuffer.destroy();
      this.normalBuffer.destroy();
      this.colorBuffer.destroy();
      this.idBuffer.destroy();
    }
  };

  return constructor;

}());
