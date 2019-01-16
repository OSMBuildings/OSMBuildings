class OBJ {

  constructor (obj, mtl, flipYZ) {
    this.flipYZ = flipYZ;
    this.materialIndex = {};
    this.vertexIndex = [];

    if (mtl) {
      this.readMTL(mtl);
    }

    this.meshes = [];

    this.readOBJ(obj);
  }

  readMTL (str) {
    const lines = str.split(/[\r\n]/g);

    let id, color = [];
    lines.forEach(line => {
      const cols = line.trim().split(/\s+/);

      switch (cols[0]) {
        case 'newmtl':
          if (id) {
            this.materialIndex[id] = color;
          }
          id = cols[1];
          color = [];
          break;

        case 'Kd':
          color = [
            parseFloat(cols[1]),
            parseFloat(cols[2]),
            parseFloat(cols[3])
          ];
          break;
      }
    });

    if (id) {
      this.materialIndex[id] = color;
    }

    str = null;
  }

  readOBJ (str) {
    let id, faces = [], color;

    str.split(/[\r\n]/g).forEach(line => {
      const cols = line.trim().split(/\s+/);

      switch (cols[0]) {
        case 'g':
        case 'o':
          this.storeMesh(id, color, faces);
          id = cols[1];
          faces = [];
          break;

        case 'usemtl':
          this.storeMesh(id, color, faces);
          if (this.materialIndex[cols[1]]) {
            color = this.materialIndex[cols[1]];
          }
          faces = [];
          break;

        case 'v':
          if (this.flipYZ) {
            this.vertexIndex.push([parseFloat(cols[1]), parseFloat(cols[3]), parseFloat(cols[2])]);
          } else {
            this.vertexIndex.push([parseFloat(cols[1]), parseFloat(cols[2]), parseFloat(cols[3])]);
          }
          break;

        case 'f':
          faces.push([parseFloat(cols[1]) - 1, parseFloat(cols[2]) - 1, parseFloat(cols[3]) - 1]);
          break;
      }
    });

    this.storeMesh(id, color, faces);
  }

  storeMesh (id, color, faces) {
    if (faces.length) {
      const geometry = this.createGeometry(faces);
      this.meshes.push({
        vertices: geometry.vertices,
        normals: geometry.normals,
        texCoords: geometry.texCoords,
        height: geometry.height,
        color: color,
        id: id
      });
    }
  }

  sub (a, b) {
    return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
  }

  len (v) {
    return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  }

  unit (a) {
    const len = this.len(a);
    return [a[0]/len, a[1]/len, a[2]/len];
  }

  /**
   * computes the normal vector of the triangle a-b-c
   */
  normal(a, b, c) {
    const d1 = this.sub(a, b), d2 = this.sub(b, c);
    // normalized cross product of d1 and d2.
    return this.unit([
      d1[1]*d2[2] - d1[2]*d2[1],
      d1[2]*d2[0] - d1[0]*d2[2],
      d1[0]*d2[1] - d1[1]*d2[0]
    ]);
  }

  createGeometry (faces) {
    const
      vertices = [],
      normals = [],
      texCoords = [];

    let height = -Infinity;

    faces.forEach(face => {
      const
        v0 = this.vertexIndex[face[0]],
        v1 = this.vertexIndex[face[1]],
        v2 = this.vertexIndex[face[2]],
        nor = this.normal(v0, v1, v2);

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
    });

    return { vertices: vertices, normals: normals, texCoords: texCoords, height: height };
  }
}

OBJ.parse = function (obj, mtl, flipYZ) {
  const parser = new OBJ(obj, mtl, flipYZ);
  return parser.meshes;
};
