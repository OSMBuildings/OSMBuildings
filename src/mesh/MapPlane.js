
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
      this.color = new Color(options.color).toArray(true);
    }*/

    this.radius = options.radius || 5000;
    this.createGlGeometry();

    this.minZoom = APP.minZoom;
    this.maxZoom = APP.maxZoom;
  }

  constructor.prototype = {

    createGlGeometry: function() {
      /* This method creates front and back faces, in case rendering 
       * effect requires both. */
      var NUM_SEGMENTS = 50;
      var segmentSize = 2*this.radius / NUM_SEGMENTS;
      this.vertexBuffer = [];
      this.normalBuffer = [];
      this.filterBuffer = [];

      var normal = [0,0,1];
      var normals = [].concat(normal, normal, normal, normal, normal, normal);

      var filterEntry = [0, 1, 1, 1];
      var filterEntries = [].concat(filterEntry, filterEntry, filterEntry,
                                    filterEntry, filterEntry, filterEntry);
      
      for (var x = 0; x < NUM_SEGMENTS; x++)
        for (var y = 0; y < NUM_SEGMENTS; y++) {
          
          
          var baseX = -this.radius + x*segmentSize;
          var baseY = -this.radius + y*segmentSize;
          this.vertexBuffer.push( baseX,               baseY, 0,
                                  baseX + segmentSize, baseY + segmentSize, 0,
                                  baseX + segmentSize, baseY, 0,
                                  
                                  baseX,               baseY, 0,
                                  baseX,               baseY + segmentSize, 0,
                                  baseX + segmentSize, baseY + segmentSize, 0);

          this.vertexBuffer.push( baseX,               baseY, 0,
                                  baseX + segmentSize, baseY, 0,
                                  baseX + segmentSize, baseY + segmentSize, 0,

                                  baseX,               baseY, 0,
                                  baseX + segmentSize, baseY + segmentSize, 0,
                                  baseX,               baseY + segmentSize, 0);

          [].push.apply(this.normalBuffer, normals);
          [].push.apply(this.normalBuffer, normals);

          [].push.apply(this.filterBuffer, filterEntries);
          [].push.apply(this.filterBuffer, filterEntries);
      }
       
      this.vertexBuffer = new GLX.Buffer(3, new Float32Array(this.vertexBuffer));
      this.normalBuffer = new GLX.Buffer(3, new Float32Array(this.normalBuffer));
      this.filterBuffer = new GLX.Buffer(4, new Float32Array(this.filterBuffer));
       
    },

    // TODO: switch to a notation like mesh.transform
    getMatrix: function() {
      //var scale = Math.pow(2, APP.zoom - 16);

      var modelMatrix = new GLX.Matrix();
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
