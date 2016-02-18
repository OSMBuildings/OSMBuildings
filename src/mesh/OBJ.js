mesh.OBJ = (function() {

  var vertexIndex = [];

  function parseMTL(str) {
    var
      lines = str.split(/[\r\n]/g),
      cols,
      materials = {},
      data = null;

    for (var i = 0, il = lines.length; i < il; i++) {
      cols = lines[i].trim().split(/\s+/);

      switch (cols[0]) {
        case 'newmtl':
          storeMaterial(materials, data);
          data = { id:cols[1], color:{} };
          break;

        case 'Kd':
          data.color = [
            parseFloat(cols[1]),
            parseFloat(cols[2]),
            parseFloat(cols[3])
          ];
          break;

        case 'd':
          data.color[3] = parseFloat(cols[1]);
          break;
      }
    }

    storeMaterial(materials, data);
    str = null;

    return materials;
  }

  function storeMaterial(materials, data) {
    if (data !== null) {
      materials[ data.id ] = data.color;
    }
  }

  function parseOBJ(str, materials) {
    var
      lines = str.split(/[\r\n]/g), cols,
      meshes = [],
      id,
      color,
      faces = [];

    for (var i = 0, il = lines.length; i < il; i++) {
      cols = lines[i].trim().split(/\s+/);

      switch (cols[0]) {
        case 'g':
        case 'o':
          storeOBJ(meshes, id, color, faces);
          id = cols[1];
          faces = [];
          break;

        case 'usemtl':
          storeOBJ(meshes, id, color, faces);
          if (materials[ cols[1] ]) {
            color = materials[ cols[1] ];
          }
          faces = [];
          break;

        case 'v':
          vertexIndex.push([parseFloat(cols[1]), parseFloat(cols[2]), parseFloat(cols[3])]);
          break;

        case 'f':
          faces.push([ parseFloat(cols[1])-1, parseFloat(cols[2])-1, parseFloat(cols[3])-1 ]);
          break;
      }
    }

    storeOBJ(meshes, id, color, faces);
    str = null;

    return meshes;
  }

  function storeOBJ(meshes, id, color, faces) {
    if (faces.length) {
      var geometry = createGeometry(faces);
      meshes.push({
        id: id,
        color: color,
        vertices: geometry.vertices,
        normals: geometry.normals
      });
    }
  }

  function createGeometry(faces) {
    var
      v0, v1, v2,
      e1, e2,
      nor, len,
      geometry = { vertices:[], normals:[] };

    for (var i = 0, il = faces.length; i < il; i++) {
      v0 = vertexIndex[ faces[i][0] ];
      v1 = vertexIndex[ faces[i][1] ];
      v2 = vertexIndex[ faces[i][2] ];

      e1 = [ v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2] ];
      e2 = [ v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2] ];

      nor = [ e1[1]*e2[2] - e1[2]*e2[1], e1[2]*e2[0] - e1[0]*e2[2], e1[0]*e2[1] - e1[1]*e2[0] ];
      len = Math.sqrt(nor[0]*nor[0] + nor[1]*nor[1] + nor[2]*nor[2]);

      nor[0] /= len;
      nor[1] /= len;
      nor[2] /= len;

      geometry.vertices.push(
        v0[0], v0[2], v0[1],
        v1[0], v1[2], v1[1],
        v2[0], v2[2], v2[1]
      );

      geometry.normals.push(
        nor[0], nor[1], nor[2],
        nor[0], nor[1], nor[2],
        nor[0], nor[1], nor[2]
      );
    }

    return geometry;
  }

  //***************************************************************************

  function constructor(url, position, options) {
    options = options || {};

    this.id = options.id;
    if (options.color) {
      this.color = new Color(options.color).toArray();
    }

    this.replace   = !!options.replace;
    this.scale     = options.scale     || 1;
    this.rotation  = options.rotation  || 0;
    this.elevation = options.elevation || 0;
    this.position  = position;

    this.minZoom = parseFloat(options.minZoom) || APP.minZoom;
    this.maxZoom = parseFloat(options.maxZoom) || APP.maxZoom;
    if (this.maxZoom < this.minZoom) {
      this.maxZoom = this.minZoom;
    }

    this.data = {
      vertices: [],
      normals: [],
      colors: [],
      ids: []
    };

    Activity.setBusy();
    this.request = Request.getText(url, function(obj) {
      this.request = null;
      var match;
      if ((match = obj.match(/^mtllib\s+(.*)$/m))) {
        this.request = Request.getText(url.replace(/[^\/]+$/, '') + match[1], function(mtl) {
          this.request = null;
          this.onLoad(obj, parseMTL(mtl));
        }.bind(this));
      } else {
        this.onLoad(obj, null);
      }
    }.bind(this));
  }

  constructor.prototype = {
    onLoad: function(obj, mtl) {
      this.items = [];
      // TODO: add single parsed items directly and save intermediate data storage
      this.addItems(parseOBJ(obj, mtl));
      this.onReady();
    },

    addItems: function(items) {
      var
        item, color, idColor, j, jl,
        id, colorVariance,
        defaultColor = new Color(DEFAULT_COLOR).toArray();

      for (var i = 0, il = items.length; i < il; i++) {
        item = items[i];

        this.data.vertices = this.data.vertices.concat(item.vertices);
        this.data.normals  = this.data.normals.concat(item.normals);

        id = this.id || item.id;
        idColor = render.Picking.idToColor(id);

        colorVariance = (id/2 % 2 ? -1 : +1) * (id % 2 ? 0.03 : 0.06);
        color = this.color || item.color || defaultColor;
        for (j = 0, jl = item.vertices.length - 2; j<jl; j += 3) {
          this.data.colors.push(color[0]+colorVariance, color[1]+colorVariance, color[2]+colorVariance);
          this.data.ids.push(idColor[0], idColor[1], idColor[2]);
        }

        this.items.push({ id:id, vertexCount:item.vertices.length/3, data:item.data });
      }
    },

    fadeIn: function() {
      var item, filters = [];
      var start = Filter.getTime() + 250, end = start + 500;
      for (var i = 0, il = this.items.length; i < il; i++) {
        item = this.items[i];
        item.filter = [start, end, 0, 1];
        for (var j = 0, jl = item.vertexCount; j < jl; j++) {
          filters.push.apply(filters, item.filter);
        }
      }
      this.filterBuffer = new glx.Buffer(4, new Float32Array(filters));
    },

    applyFilter: function() {
      var item, filters = [];
      for (var i = 0, il = this.items.length; i < il; i++) {
        item = this.items[i];
        for (var j = 0, jl = item.vertexCount; j < jl; j++) {
          filters.push.apply(filters, item.filter);
        }
      }
      this.filterBuffer = new glx.Buffer(4, new Float32Array(filters));
    },

    onReady: function() {
      this.vertexBuffer = new glx.Buffer(3, new Float32Array(this.data.vertices));
      this.normalBuffer = new glx.Buffer(3, new Float32Array(this.data.normals));
      this.colorBuffer  = new glx.Buffer(3, new Float32Array(this.data.colors));
      this.idBuffer     = new glx.Buffer(3, new Float32Array(this.data.ids));
      this.fadeIn();
      this.data = null;

      Filter.apply(this);
      data.Index.add(this);

      this.isReady = true;
      Activity.setIdle();
    },

    // TODO: switch to a notation like mesh.transform
    getMatrix: function() {
      var matrix = new glx.Matrix();

      if (this.elevation) {
        matrix.translate(0, 0, this.elevation);
      }

      matrix.scale(this.scale, this.scale, this.scale);

      if (this.rotation) {
        matrix.rotateZ(-this.rotation);
      }

      var metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * 
                                     Math.cos(MAP.position.latitude / 180 * Math.PI);

      var dLat = this.position.latitude - MAP.position.latitude;
      var dLon = this.position.longitude- MAP.position.longitude;
      
      matrix.translate( dLon * metersPerDegreeLongitude,
                       -dLat * METERS_PER_DEGREE_LATITUDE, 0);
      
      return matrix;
    },

    destroy: function() {
      data.Index.remove(this);

      if (this.request) {
        this.request.abort();
      }

      this.items = [];

      if (this.isReady) {
        this.vertexBuffer.destroy();
        this.normalBuffer.destroy();
        this.colorBuffer.destroy();
        this.idBuffer.destroy();
      }
    }
  };

  return constructor;

}());
