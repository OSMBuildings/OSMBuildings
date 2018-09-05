
function getOrigin (geometry) {
  const coordinates = geometry.coordinates;
  switch (geometry.type) {
    case 'Point':
      return coordinates;

    case 'MultiPoint':
    case 'LineString':
      return coordinates[0];

    case 'MultiLineString':
    case 'Polygon':
      return coordinates[0][0];

    case 'MultiPolygon':
      return coordinates[0][0][0];
  }
}

function getPickingColor (i) {
  i++;
  return [0, (i & 0xff) / 255, ((i >> 8) & 0xff) / 255];
}

//*****************************************************************************

onmessage = function(e) {
  const params = e.data;

  if (params.type === 'GeoJSON') {
    loadGeoJSON(params.url, params.options);
  }

  if (params.type === 'OBJ') {
    loadOBJ(params.url, params.options);
  }
};

function postResult(items, position, tri) {
  const res = {
    items: items,
    position: position,
    vertices: new Float32Array(tri.vertices),
    normals: new Float32Array(tri.normals),
    colors: new Float32Array(tri.colors),
    texCoords: new Float32Array(tri.texCoords),
    heights: new Float32Array(tri.heights),
    pickingColors: new Float32Array(tri.pickingColors)
  };

  postMessage(res, [
    res.vertices.buffer,
    res.normals.buffer,
    res.colors.buffer,
    res.texCoords.buffer,
    res.heights.buffer,
    res.pickingColors.buffer
  ]);
}

//*****************************************************************************

function loadGeoJSON (url, options = {}) {
  if (typeof url === 'object') {
    postMessage('load');
    processGeoJSON(url, options);
  } else {
    Request.getJSON(url, (err, geojson) => {
      if (err) {
        postMessage('error');
      } else {
        postMessage('load');
        processGeoJSON(geojson, options);
      }
    });
  }
}

function processGeoJSON (geojson, options) {
  if (!geojson || !geojson.features.length) {
    postMessage('error'); // TODO: not really an error
    return;
  }

  const tri = {
    vertices: [],
    normals: [],
    colors: [],
    texCoords: [],
    heights: [],
    pickingColors: []
  };

  const
    items = [],
    origin = getOrigin(geojson.features[0].geometry),
    position = { latitude: origin[1], longitude: origin[0] };

  geojson.features.forEach((feature, i) => {
    // APP.events.emit('loadfeature', feature); // TODO

    const
      properties = feature.properties,
      id = options.id || feature.id,
      pickingColor = getPickingColor(i); // picks per part id - could perhaps use building id

    let vertexCount = tri.vertices.length;
    triangulate(tri, feature, origin);
    vertexCount = (tri.vertices.length - vertexCount) / 3;

    for (let i = 0; i < vertexCount; i++) {
      tri.heights.push(properties.height);
      tri.pickingColors.push(...pickingColor);
    }

    items.push({ id: id, properties: properties, vertexCount: vertexCount });
  });

  postResult(items, position, tri);
}

//*****************************************************************************

function loadOBJ (url, options = {}) {
  Request.getText(url, (err, obj) => {
    if (err) {
      postMessage('error');
      return;
    }

    let match = obj.match(/^mtllib\s+(.*)$/m);
    if (!match) {
      postMessage('load');
      processOBJ(obj, null, options);
    } else {
      Request.getText(url.replace(/[^\/]+$/, '') + match[1], (err, mtl) => {
        if (err) {
          postMessage('error');
        } else {
          postMessage('load');
          processOBJ(obj, mtl, options);
        }
      });
    }
  });
}

function processOBJ(obj, mtl, options = {}) {
  const tri = {
    vertices: [],
    normals: [],
    colors: [],
    texCoords: [],
    heights: [],
    pickingColors: []
  };

  const
    items = [],
    optionColor = Qolor.parse(options.color).toArray(),
    position = options.position;

  const meshes = OBJ.parse(obj, mtl);

  meshes.forEach((mesh, index) => {
    // APP.events.emit('loadfeature', mesh); // TODO

    tri.vertices.push(...mesh.vertices);
    tri.normals.push(...mesh.normals);
    tri.texCoords.push(...mesh.texCoords);

    const
      id = options.id || mesh.id,
      colorVariance = (id / 2 % 2 ? -1 : +1) * (id % 2 ? 0.03 : 0.06),
      color = optionColor || mesh.color || DEFAULT_COLOR,
      vertexCount = mesh.vertices.length / 3,
      pickingColor = getPickingColor(0);

    for (let i = 0; i < vertexCount; i++) {
      tri.colors.push(color[0]+colorVariance, color[1]+colorVariance, color[2]+colorVariance);
      tri.heights.push(mesh.height);
      tri.pickingColors.push(...pickingColor);
    }

    items.push({ id: id, properties: {}, vertexCount: vertexCount });
  });

  postResult(items, position, tri);
}
