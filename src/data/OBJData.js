const OBJFormat = {};

(function () {

  OBJFormat.parseMTL = function (str) {
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
          data = { id: cols[1], color: {} };
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

  function storeMaterial (materials, data) {
    if (data !== null) {
      materials[data.id] = data.color;
    }
  }

  OBJFormat.parse = function(str, materials) {
    var
      vertexIndex = [],
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
          storeOBJ(vertexIndex, meshes, id, color, faces);
          id = cols[1];
          faces = [];
          break;

        case 'usemtl':
          storeOBJ(vertexIndex, meshes, id, color, faces);
          if (materials[cols[1]]) {
            color = materials[cols[1]];
          }
          faces = [];
          break;

        case 'v':
          vertexIndex.push([parseFloat(cols[1]), parseFloat(cols[2]), parseFloat(cols[3])]);
          break;

        case 'f':
          faces.push([parseFloat(cols[1]) - 1, parseFloat(cols[2]) - 1, parseFloat(cols[3]) - 1]);
          break;
      }
    }

    storeOBJ(vertexIndex, meshes, id, color, faces);
    str = null;

    return meshes;
  }

  function storeOBJ (vertexIndex, meshes, id, color, faces) {
    if (faces.length) {
      var geometry = createGeometry(vertexIndex, faces);
      meshes.push({
        vertices: geometry.vertices,
        normals: geometry.normals,
        color: color,
        texCoords: geometry.texCoords,
        id: id,
        height: geometry.height
      });
    }
  }

  function createGeometry (vertexIndex, faces) {
    var
      v0, v1, v2,
      nor,
      vertices = [],
      normals = [],
      texCoords = [],
      height = -Infinity;

    for (var i = 0, il = faces.length; i < il; i++) {
      v0 = vertexIndex[faces[i][0]];
      v1 = vertexIndex[faces[i][1]];
      v2 = vertexIndex[faces[i][2]];

      nor = normal(v0, v1, v2);

      vertices.push(
        v0[0], v0[2], v0[1],
        v1[0], v1[2], v1[1],
        v2[0], v2[2], v2[1]
      );

      normals.push(
        nor[0], nor[1], nor[2],
        nor[0], nor[1], nor[2],
        nor[0], nor[1], nor[2]
      );

      texCoords.push(
        0.0, 0.0,
        0.0, 0.0,
        0.0, 0.0
      );

      height = Math.max(height, v0[1], v1[1], v2[1]);
    }

    return { vertices: vertices, normals: normals, texCoords: texCoords, height: height };
  }
}());

//*****************************************************************************







class OBJData extends DataItem {

  constructor (url, position, options, callback) {
    super(url, options, callback);

    this.color = Qolor.parse(options.color).toArray(); // TODO: move to worker
    this.position = position; // TODO: move to worker

    this.load();
  }

  load () {
    const triangles = {
      vertices: [],
      normals: [],
      colors: [],
      texCoords: [],
      ids: []
    };

    this.request = Request.getText(this.url, (error, obj) => {
      this.request = null;
      if (error) {
        return;
      }

      let match;
      if ((match = obj.match(/^mtllib\s+(.*)$/m))) {
        this.request = Request.getText(this.url.replace(/[^\/]+$/, '') + match[1], (error, mtl) => {
          this.request = null;
          if (error) {
            return;
          }

          this.onLoad(obj, OBJFormat.parseMTL(mtl));
        });
      } else {
        this.onLoad(obj, null);
      }
    });
  }

  onLoad (obj, mtl) {
    this.items = [];

    const items = OBJFormat.parse(obj, mtl);

    items.forEach(feature => {
      /**
       * Fired when a 3d object has been loaded
       * @fires OSMBuildings#loadfeature
       */
      Events.emit('loadfeature', feature);

      [].push.apply(this.data.vertices, feature.vertices);
      [].push.apply(this.data.normals, feature.normals);
      [].push.apply(this.data.texCoords, feature.texCoords);

      const
        id = this.id || feature.id,
        idColor = render.Picking.idToColor(id),
        colorVariance = (id / 2 % 2 ? -1 : +1) * (id % 2 ? 0.03 : 0.06),
        color = this.color || feature.color || DEFAULT_COLOR;

      for (let i = 0; i < feature.vertices.length - 2; i += 3) {
        [].push.apply(this.data.colors, add3scalar(color, colorVariance));
        [].push.apply(this.data.ids, idColor);
      }

      this.items.push({ id: id, vertexCount: feature.vertices.length / 3, height: feature.height });
    });


    // ... create Buffers
  }

  // getMatrix();
  // matrix.scale(this.scale, this.scale, this.scale); // TODO
}
