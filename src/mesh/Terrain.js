
mesh.Terrain = (function() {

  function constructor(url, options) {
    options = options || {};

    this.id = options.id;
    this.minZoom = parseFloat(options.minZoom) || APP.minZoom;
    this.maxZoom = parseFloat(options.maxZoom) || APP.maxZoom;
    if (this.maxZoom < this.minZoom) {
      this.maxZoom = this.minZoom;
    }

    //FIXME: more robust passing of x/y/z
    var re = new RegExp(".*/(\\d+)/(\\d+)/(\\d+)\\.png");
    //var re = new RegExp(".*(\\d+)\\.png");
    var m = url.match(re);
    this.z = parseInt(m[1]);
    this.x = parseInt(m[2]);
    this.y = parseInt(m[3]);
    this.geoCenter = { 
      latitude: tile2lat(this.y+0.5, this.z), 
      longitude: tile2lon(this.x+0.5, this.z)
    };
    
    Activity.setBusy();
    
    var onload = function() {
      if (this.heightImage.complete && this.normalImage.complete && 
          this.mapImage.complete && !this.isReady
      ) {
        this.setData();
      }
    }.bind(this);

    
    this.heightImage = new Image();
    this.heightImage.crossOrigin = "Anonymous"; //enable CORS
    this.heightImage.onload = onload;
    this.heightImage.src = url;
    
    this.normalImage = new Image();
    this.normalImage.crossOrigin = "Anonymous";
    this.normalImage.onload = onload;
    this.normalImage.src = "https://terrain-preview.mapzen.com/normal/" + this.z + "/" + this.x + "/" + this.y + ".png";
    
    this.mapImage = new Image();
    this.mapImage.crossOrigin = "Anonymous";
    this.mapImage.onload = onload;
    this.mapImage.src = 'https://a.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/'+ this.z+'/' + this.x + '/' + this.y+'.png';

  }

  constructor.prototype = {
    getRawData: function(image) {
      var canvas = document.createElement("CANVAS");
      canvas.width = image.width;
      canvas.height= image.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      return ctx.getImageData(0, 0, image.width, image.height).data;
    },
    
    setData: function() {
      
      //console.log("image loaded");
      if (this.heightImage.width != this.normalImage.width ||
          this.heightImage.height!= this.normalImage.height ||
          this.mapImage.width != this.normalImage.width ||
          this.mapImage.height!= this.normalImage.height
      ) {
        console.log("[ERROR] height map, texture map and normal maps have different sizes");
        return;
      }

      if (this.heightImage.width != this.heightImage.height) {
        console.log("[ERROR] terrain tile " + this.heightImage.src + " is not square.");
      }

      var width = this.heightImage.width;
      var height = this.heightImage.height;
      
      var heightData = this.getRawData(this.heightImage);
      var normalData = this.getRawData(this.normalImage);
      var mapData = this.getRawData(this.mapImage);
      
      var getHeight = function(x, y) {
        x = Math.min( x, width-1);
        y = Math.min( y, height-1);
        var r = heightData[(y * width + x) * 4    ];
        var g = heightData[(y * width + x) * 4 + 1];
        var b = heightData[(y * width + x) * 4 + 2];
        return r * 256 + g + b / 256 - 32768;
      };
      
      var getNormal = function(x, y) {
        x = Math.min( x, width-1);
        y = Math.min( y, height-1);
        var r = normalData[(y * width + x) * 4    ];
        var g = normalData[(y * width + x) * 4 + 1];
        var b = normalData[(y * width + x) * 4 + 2];
        return norm3([r / 127.5 - 1.0, g / 127.5 - 1.0, b / 127.5 - 1.0]);
      };
      
      var getColor = function(x, y) {
        x = Math.min( x, width-1);
        y = Math.min( y, height-1);
        var r = mapData[(y * width + x) * 4    ];
        var g = mapData[(y * width + x) * 4 + 1];
        var b = mapData[(y * width + x) * 4 + 2];
        return [r/255, g/255, b/255];
      };
      

      var tileSizeInMeters = getTileSizeInMeters( this.geoCenter.latitude, this.z);
      var metersPerPixel= tileSizeInMeters / width;

      var vertices = [];
      var texCoords= [];
      var normals  = [];
      var colors   = [];
      var pickingColors = [];
      var filter = [];

      var filterEntry = [0, 1, 1, 1];
      var normal = [0, 0, 1];

      for (var y = 0; y < height; y++) {
        var geoY = (y - height/2) * metersPerPixel;
        for (var x = 0; x < width; x++) {

          var geoX = (x - width/2) * metersPerPixel;
          vertices.push(
            geoX,                  geoY,                  getHeight(x, y),
            geoX,                  geoY + metersPerPixel, getHeight(x, y+1),
            geoX + metersPerPixel, geoY + metersPerPixel, getHeight(x+1, y+1),
            
            geoX,                  geoY,                  getHeight(x, y),
            geoX + metersPerPixel, geoY + metersPerPixel, getHeight(x+1, y+1),
            geoX + metersPerPixel, geoY,                  getHeight(x+1, y)
          );
          
          texCoords.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
          pickingColors.push(255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255);
          [].push.apply(normals, [].concat(
            getNormal(x, y), getNormal(x, y+1),   getNormal(x+1, y+1),
            getNormal(x, y), getNormal(x+1, y+1), getNormal(x+1, y)
          ));
          [].push.apply(filter, [].concat(filterEntry, filterEntry, filterEntry, filterEntry, filterEntry, filterEntry));
          
          /*[].push.apply(colors, getColor(x,   y  ));
          [].push.apply(colors, getColor(x,   y+1));
          [].push.apply(colors, getColor(x+1, y+1));
          [].push.apply(colors, getColor(x,   y  ));
          [].push.apply(colors, getColor(x+1, y+1));
          [].push.apply(colors, getColor(x+1, y  ));*/
          
          [].push.apply(colors, add3scalar(mul3scalar(getNormal(x,   y  ), 0.5), 0.5));
          [].push.apply(colors, add3scalar(mul3scalar(getNormal(x,   y+1), 0.5), 0.5));
          [].push.apply(colors, add3scalar(mul3scalar(getNormal(x+1, y+1), 0.5), 0.5));
          [].push.apply(colors, add3scalar(mul3scalar(getNormal(x,   y  ), 0.5), 0.5));
          [].push.apply(colors, add3scalar(mul3scalar(getNormal(x+1, y+1), 0.5), 0.5));
          [].push.apply(colors, add3scalar(mul3scalar(getNormal(x+1, y  ), 0.5), 0.5));
          /*for (var i = 0; i < 18; i++)
            colors.push( Math.random());*/
        }
        
      }
      this.vertexBuffer   = new GLX.Buffer(3, new Float32Array(vertices));
      this.normalBuffer   = new GLX.Buffer(3, new Float32Array(normals));
      this.texCoordBuffer = new GLX.Buffer(2, new Float32Array(texCoords));
      this.colorBuffer    = new GLX.Buffer(3, new Float32Array(colors));
      this.idBuffer       = new GLX.Buffer(3, new Float32Array(pickingColors));
      this.filterBuffer   = new GLX.Buffer(4, new Float32Array(filter));

      data.Index.add(this);

      this.isReady = true;
      this.heightImage.onload = null;
      this.normalImage.onload = null;
      this.mapImage.onload = null;
      delete this.heightImage;
      delete this.normalImage;
      delete this.mapImage;
      Activity.setIdle();
    },

    // TODO: switch to a notation like mesh.transform
    getMatrix: function() {
      var matrix = new GLX.Matrix();
      // this position is available once geometry processing is complete.
      // should not be failing before because of this.isReady
      var dLat = this.geoCenter.latitude - MAP.position.latitude;
      var dLon = this.geoCenter.longitude - MAP.position.longitude;

      var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * Math.cos(MAP.position.latitude / 180 * Math.PI);

      matrix.translate( dLon*metersPerDegreeLongitude, -dLat*METERS_PER_DEGREE_LATITUDE, 0);

      return matrix;
    },

    destroy: function() {
      data.Index.remove(this);

      if (this.isReady) {
        this.vertexBuffer.destroy();
        this.normalBuffer.destroy();
        this.texCoordBuffer.destroy();
        this.colorBuffer.destroy();
        this.idBuffer.destroy();
        this.filterBuffer.destroy();
      }

      this.isReady = false;
      if (this.heightImage) {
        this.heightImage.onload = null;
        delete this.heightImage;
      }
      
      if (this.normalImage) {
        this.normalImage.onload = null;
        delete this.normalImage;
      }
      
      if (this.mapImage) {
        this.mapImage.onload = null;
        delete this.mapImage;
      }
    }
  };

  return constructor;

}());
