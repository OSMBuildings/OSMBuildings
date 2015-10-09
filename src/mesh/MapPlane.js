
/* A 'MapPlane' object is a rectangular mesh in the X/Y plane (Z=0) that is
 * guaranteed to cover all of the area of that plane that is inside the skydome.
 *
 * A 'MapPlane' is untextured and featureless. Its intended use is as a stand-in
 * for a 'BaseMap' in situations where either using the actual BaseMap would be
 * inefficient (e.g. when the BaseMap would be rendered without a texture) or 
 * no BaseMap is present (e.g. if OSMBuildings is used as an overlay to Leaflet
 * or MapBoxGL). This mostly applies to creating depth and normal textures of the
 * scene, not to the actual shaded scene rendering.

*/

mesh.MapPlane = (function() {

  function constructor(options) {
    options = options || {};

    this.id = options.id;
    /*if (options.color) {
      this.color = Color.parse(options.color).toRGBA(true);
    }*/

    this.radius = options.radius || 500;
    this.createGlGeometry();

    this.minZoom = APP.minZoom;
    this.maxZoom = APP.maxZoom;
  }

  constructor.prototype = {

    createGlGeometry: function() {

      this.vertexBuffer = new glx.Buffer(3, new Float32Array([
        -this.radius, -this.radius, 0,
         this.radius,  this.radius, 0,
         this.radius, -this.radius, 0,
        
         this.radius,  this.radius, 0,
        -this.radius, -this.radius, 0,
        -this.radius,  this.radius, 0]));

      /*
      this.dummyMapPlaneTexCoords = new glx.Buffer(2, new Float32Array([
        0.0, 0.0,
          1, 0.0,
          1,   1,
        
        0.0, 0.0,
          1,   1,
        0.0,   1]));*/

      this.normalBuffer = new glx.Buffer(3, new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        
        0, 0, 1,
        0, 0, 1,
        0, 0, 1]));

      //this.numDummyVertices = 6;

      this.isReady = true;
    },

    // TODO: switch to mesh.transform
    getMatrix: function() {
      var scale = render.fogRadius/this.radius;
      var modelMatrix = new glx.Matrix();
      modelMatrix.scale(scale, scale, scale);
    
      return modelMatrix;
    },

    destroy: function() {

      this.items = null;

      if (this.isReady) {
        this.vertexBuffer.destroy();
        this.normalBuffer.destroy();
        //this.colorBuffer.destroy();
        //this.idColorBuffer.destroy();
      }
    }
  };

  return constructor;

}());
