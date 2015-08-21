
var GeoJSON = {};

(function() {

  var METERS_PER_LEVEL = 3;

  var materialColors = {
    brick:'#cc7755',
    bronze:'#ffeecc',
    canvas:'#fff8f0',
    concrete:'#999999',
    copper:'#a0e0d0',
    glass:'#e8f8f8',
    gold:'#ffcc00',
    plants:'#009933',
    metal:'#aaaaaa',
    panel:'#fff8f0',
    plaster:'#999999',
    roof_tiles:'#f08060',
    silver:'#cccccc',
    slate:'#666666',
    stone:'#996666',
    tar_paper:'#333333',
    wood:'#deb887'
  };

  var baseMaterials = {
    asphalt:'tar_paper',
    bitumen:'tar_paper',
    block:'stone',
    bricks:'brick',
    glas:'glass',
    glassfront:'glass',
    grass:'plants',
    masonry:'stone',
    granite:'stone',
    panels:'panel',
    paving_stones:'stone',
    plastered:'plaster',
    rooftiles:'roof_tiles',
    roofingfelt:'tar_paper',
    sandstone:'stone',
    sheet:'canvas',
    sheets:'canvas',
    shingle:'tar_paper',
    shingles:'tar_paper',
    slates:'slate',
    steel:'metal',
    tar:'tar_paper',
    tent:'canvas',
    thatch:'plants',
    tile:'roof_tiles',
    tiles:'roof_tiles'
    // cardboard
    // eternit
    // limestone
    // straw
  };

  function getMaterialColor(str) {
    str = str.toLowerCase();
    if (str[0] === '#') {
      return str;
    }
    return materialColors[baseMaterials[str] || str] || null;
  }

  var WINDING_CLOCKWISE = 'CW';
  var WINDING_COUNTER_CLOCKWISE = 'CCW';

  // detect winding direction: clockwise or counter clockwise
  function getWinding(polygon) {
    var
      x1, y1, x2, y2,
      a = 0;

    for (var i = 0, il = polygon.length-1; i < il; i++) {
      x1 = polygon[i][0];
      y1 = polygon[i][1];

      x2 = polygon[i+1][0];
      y2 = polygon[i+1][1];

      a += x1*y2 - x2*y1;
    }
    return (a/2) > 0 ? WINDING_CLOCKWISE : WINDING_COUNTER_CLOCKWISE;
  }

  // enforce a polygon winding direcetion. Needed for proper backface culling.
  function makeWinding(polygon, direction) {
    var winding = getWinding(polygon);
    return (winding === direction) ? polygon : polygon.reverse();
  }

  function alignProperties(prop) {
    var item = {};
    var color;

    prop = prop || {};

    item.height    = prop.height    || (prop.levels   ? prop.levels  *METERS_PER_LEVEL : DEFAULT_HEIGHT);
    item.minHeight = prop.minHeight || (prop.minLevel ? prop.minLevel*METERS_PER_LEVEL : 0);

    var wallColor = prop.material ? getMaterialColor(prop.material) : (prop.wallColor || prop.color);
    item.wallColor = (color = Color.parse(wallColor)) ? color.toRGBA(true) : DEFAULT_COLOR;

    var roofColor = prop.roofMaterial ? getMaterialColor(prop.roofMaterial) : prop.roofColor;
    item.roofColor = (color = Color.parse(roofColor)) ? color.toRGBA(true) : DEFAULT_COLOR;

    switch (prop.shape) {
      case 'cylinder':
      case 'cone':
      case 'dome':
      case 'sphere':
        item.shape = prop.shape;
        item.isRotational = true;
        break;

      case 'pyramid':
        item.shape = prop.shape;
        break;
    }

    switch (prop.roofShape) {
      case 'cone':
      case 'dome':
        item.roofShape = prop.roofShape;
        item.isRotational = true;
        break;

      case 'pyramid':
        item.roofShape = prop.roofShape;
        break;
    }

    if (item.roofShape && prop.roofHeight) {
      item.roofHeight = prop.roofHeight;
      item.height = Math.max(0, item.height-item.roofHeight);
    } else {
      item.roofHeight = 0;
    }

    if (item.height+item.roofHeight <= item.minHeight) {
      return;
    }

    if (prop.relationId) {
      item.relationId = prop.relationId;
    }

    return item;
  }

  function getGeometries(geometry) {
    var i, il, polygonRings, sub;
    switch (geometry.type) {
      case 'GeometryCollection':
        var geometries = [];
        for (i = 0, il = geometry.geometries.length; i < il; i++) {
          if ((sub = getGeometries(geometry.geometries[i]))) {
            geometries.push.apply(geometries, sub);
          }
        }
        return geometries;

      case 'MultiPolygon':
        var polygons = [];
        for (i = 0, il = geometry.coordinates.length; i < il; i++) {
          if ((sub = getGeometries({ type: 'Polygon', coordinates: geometry.coordinates[i] }))) {
            polygons.push.apply(geometries, sub);
          }
        }
        return polygons;

      case 'Polygon':
        polygonRings = geometry.coordinates;
        break;

      default: return [];
    }

    var res = [];
    for (i = 0, il = polygonRings.length; i < il; i++) {
      res[i] = makeWinding(polygonRings[i], i ? WINDING_CLOCKWISE : WINDING_COUNTER_CLOCKWISE);
    }
    return [res];
  }

  function transform(origin, worldSize, polygon) {
    var
      res = [],
      r, rl, p,
      ring;

    for (var i = 0, il = polygon.length; i < il; i++) {
      ring = polygon[i];
      res[i] = [];
      for (r = 0, rl = ring.length-1; r < rl; r++) {
        p = project(ring[r][1], ring[r][0], worldSize);
        res[i][r] = [p.x-origin.x, p.y-origin.y];
      }
    }

    return res;
  }

  function parseFeature(res, origin, worldSize, feature) {
    var
      geometries,
      tris,
      item, polygon, bbox, radius, center, id;

    if (!(item = alignProperties(feature.properties))) {
      return;
    }

    geometries = getGeometries(feature.geometry);

    for (var  i = 0, il = geometries.length; i < il; i++) {
      polygon = transform(origin, worldSize, geometries[i]);

      id = feature.properties.relationId || feature.id || feature.properties.id;

      if ((item.roofShape === 'cone' || item.roofShape === 'dome') && !item.shape && isRotational(polygon)) {
        item.shape = 'cylinder';
        item.isRotational = true;
      }

      bbox = getBBox(polygon);
      center = [bbox.minX + (bbox.maxX - bbox.minX)/2, bbox.minY + (bbox.maxY - bbox.minY)/2];

      if (item.isRotational) {
        radius = (bbox.maxX - bbox.minX)/2;
      }

      tris = { vertices: [], normals: [] };

      switch (item.shape) {
        case 'cylinder':
          Triangulate.cylinder(tris, center, radius, radius, item.minHeight, item.height);
          break;

        case 'cone':
          Triangulate.cylinder(tris, center, radius, 0, item.minHeight, item.height);
          break;

        case 'dome':
          Triangulate.dome(tris, center, radius, item.minHeight, item.height);
          break;

        case 'sphere':
          Triangulate.cylinder(tris, center, radius, radius/2, item.minHeight, item.height);
          break;

        case 'pyramid':
          Triangulate.pyramid(tris, polygon, center, item.minHeight, item.height);
          break;

        default:
          Triangulate.extrusion(tris, polygon, item.minHeight, item.height);
      }

      res.push({
        id: id,
        color: item.wallColor,
        vertices: tris.vertices,
        normals: tris.normals
      });

      tris = { vertices:[], normals:[] };

      switch (item.roofShape) {
        case 'cone':
          Triangulate.cylinder(tris, center, radius, 0, item.height, item.height+item.roofHeight);
          break;

        case 'dome':
          Triangulate.dome(tris, center, radius, item.height, item.height+item.roofHeight);
          break;

        case 'pyramid':
          Triangulate.pyramid(tris, polygon, center, item.height, item.height+item.roofHeight);
          break;

        default:
          if (item.shape === 'cylinder') {
            Triangulate.circle(tris, center, radius, item.height);
          } else if (item.shape === undefined) {
            Triangulate.polygon(tris, polygon, item.height);
          }
      }

      res.push({
        id: id,
        color: item.roofColor,
        vertices: tris.vertices,
        normals: tris.normals
      });
    }
  }

  //***************************************************************************

  GeoJSON.parse = function(position, worldSize, geojson) {
    var res = [];

    if (geojson && geojson.type === 'FeatureCollection' && geojson.features.length) {

      var
        collection = geojson.features,
        origin = project(position.latitude, position.longitude, worldSize);

      for (var i = 0, il = collection.length; i<il; i++) {
        parseFeature(res, origin, worldSize, collection[i]);
      }
    }

    return res;
  };

}());
