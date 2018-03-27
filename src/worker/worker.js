
importScripts(
  './../Request.js',
  './../mesh/index.js',
  './../mesh/GeoJSON.js',
  './../triangulate/index.js',
  './../../node_modules/qolor/dist/Qolor.js',
  './../triangulate/roofs/index.js',
  './../triangulate/roofs/Tools.js',
  './../triangulate/split.js',
  './../triangulate/earcut.custom.js',
  './../triangulate/geometry/vec3.js',
  './../triangulate/geometry/vec2.js',
  './../render/index.js',
  './../render/Picking.js'
);
// importScripts('./variables.js');
// importScripts('./Activity.js');
// importScripts('./glx/index.js', './glx/Buffer.js');

addEventListener('message', onMessage, false);

function onMessage(e) {   
 
  if (e.data.action === 'load') { 
    Request.getJSON(e.data.url, geojson => {     
      const res = process(geojson, e.data.options);
      res.number = e.data.number;
      postMessage(res, [res.vertices.buffer, res.normals.buffer, res.colors.buffer, res.texCoords.buffer, res.idColors.buffer]);
    });
  }

  if (e.data.action === 'process') {
    const res = process(e.data.geojson, e.data.options);
    res.number = e.data.number;
    postMessage(res, [res.vertices.buffer, res.normals.buffer, res.colors.buffer, res.texCoords.buffer, res.idColors.buffer]);
  }
}

function process(geojson, options) {
  if (!geojson || !geojson.features.length) {

    return;
  }

  const
    buffers = {
      vertices: [],
      normals: [],
      colors: [],
      texCoords: [],
      idColors: []
    },
    items = [],
    origin = getOrigin(geojson.features[0].geometry),
    position = { latitude: origin[1], longitude: origin[0] };

  geojson.features.forEach(function(feature) {
    // APP.emit('loadfeature', feature); // TODO

    const
      properties = feature.properties,
      id = options.forcedId || properties.relationId || feature.id || properties.id,
      idColor = render.Picking.idToColor(id);
      // TODO: forcedColor

    let vertexCount = buffers.vertices.length;
    triangulate(buffers, feature, origin);
    vertexCount = (buffers.vertices.length - vertexCount) / 3;

    for (let i = 0; i < vertexCount; i++) {
      [].push.apply(buffers.idColors, idColor);
    }

    items.push({ id: id, vertexCount: vertexCount, height: properties.height, data: properties.data });
  });

  return {
    items: items,
    position: position,
    vertices: new Float32Array(buffers.vertices),
    normals: new Float32Array(buffers.normals),
    colors: new Float32Array(buffers.colors),
    texCoords: new Float32Array(buffers.texCoords),
    idColors: new Float32Array(buffers.idColors)
  };
}

function getOrigin(geometry) {
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
