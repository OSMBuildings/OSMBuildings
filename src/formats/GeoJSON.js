
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

  function alignProperties(prop) {
    var item = {};
    var color;

    prop = prop || {};

    item.height    = prop.height    || (prop.levels   ? prop.levels  *METERS_PER_LEVEL : DEFAULT_HEIGHT);
    item.minHeight = prop.minHeight || (prop.minLevel ? prop.minLevel*METERS_PER_LEVEL : 0);

    var wallColor = prop.material ? getMaterialColor(prop.material) : (prop.wallColor || prop.color);
    item.wallColor = (color = Color.parse(wallColor)) ? color.toRGBA() : DEFAULT_COLOR;

    var roofColor = prop.roofMaterial ? getMaterialColor(prop.roofMaterial) : prop.roofColor;
    item.roofColor = (color = Color.parse(roofColor)) ? color.toRGBA() : DEFAULT_COLOR;

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
    var geometries = [], sub, i, il;
    switch (geometry.type) {
      case 'GeometryCollection':
        for (i = 0, il = geometry.geometries.length; i < il; i++) {
          if ((sub = getGeometries(geometry.geometries[i]))) {
            geometries.push.apply(geometries, sub);
          }
        }
        return geometries;

      case 'MultiPolygon':
        for (i = 0, il = geometry.coordinates.length; i < il; i++) {
          if ((sub = getGeometries({ type: 'Polygon', coordinates: geometry.coordinates[i] }))) {
            geometries.push.apply(geometries, sub);
          }
        }
        return geometries;

      case 'Polygon':
        return [geometry.coordinates];

      default: return [];
    }
  }

  function transform(coordinates) {
    var
      res = [],
      r, rl, p,
      ring;

    for (var c = 0, cl = coordinates.length; c < cl; c++) {
      ring = coordinates[c];
      res[c] = [];
      for (r = 0, rl = ring.length-1; r < rl; r++) {
        p = project(ring[r][1], ring[r][0], EARTH_CIRCUMFERENCE);
        res[c][r] = [p.x, p.y];
      }
    }
    return res;
  }

  function translate(item, originX, originY) {
    var polygon = item.polygon;
    for (var i = 0, il = item.polygon.length, j, jl; i < il; i++) {
      for (j = 0, jl = polygon[i].length; j < jl; j++) {
        polygon[i][j][0] -= originX;
        polygon[i][j][1] -= originY;
      }
    }

    var bbox = item.bbox;
    bbox.minX -= originX;
    bbox.minY -= originY;
    bbox.maxX -= originX;
    bbox.maxY -= originY;
  }

  GeoJSON.parse = function(geojson) {
    var res = [];

    if (!geojson || geojson.type !== 'FeatureCollection') {
      return res;
    }

    var
      collection = geojson.features,
      feature,
      baseItem, clonedItem,
      originX = Infinity, originY = Infinity,
      geometries,
      j, jl;

    var parsedItems = [];
    for (var i = 0, il = collection.length; i<il; i++) {
      feature = collection[i];

      if (!(baseItem = alignProperties(feature.properties))) {
        continue;
      }

      baseItem.id = feature.properties.relationId || feature.id || feature.properties.id;

      geometries = getGeometries(feature.geometry);

      for (j = 0, jl = geometries.length; j<jl; j++) {
        clonedItem = Object.create(baseItem);
        clonedItem.polygon = transform(geometries[j]);

        clonedItem.bbox = getBBox(clonedItem.polygon);
        originX = Math.min(originX, clonedItem.bbox.minX);
        originY = Math.min(originY, clonedItem.bbox.minY);

        parsedItems.push(clonedItem);
      }
    }

    var item, polygon, radius, center, tris;
    for (var i = 0, il = parsedItems.length; i<il; i++) {
      item = parsedItems[i];

      translate(item, originX, originY);

      if ((item.roofShape === 'cone' || item.roofShape === 'dome') && !item.shape && isRotational(item.polygon)) {
        item.shape = 'cylinder';
        item.isRotational = true;
      }

      if (item.isRotational) {
        radius = (item.bbox.maxX-item.bbox.minX)/2;
      }

      center = [item.bbox.minX + (item.bbox.maxX - item.bbox.minX)/2, item.bbox.minY + (item.bbox.maxY - item.bbox.minY)/2];

      tris = { vertices:[], normals:[] };

      switch (item.shape) {
        case 'cylinder':
          Triangulate.cylinder(tris, center, radius, radius, item.minHeight, item.height);
        break;

        case 'cone':
          Triangulate.cylinder(tris, center, radius, 0, item.minHeight, item.height);
        break;

        case 'sphere':
          Triangulate.cylinder(tris, center, radius, radius/2, item.minHeight, item.height);
          //Triangulate.circle(tris, center, radius/2, item.height, item.roofColor);
        break;

        case 'pyramid':
          Triangulate.pyramid(tris, item.polygon, center, item.minHeight, item.height);
        break;

        default:
          Triangulate.extrusion(tris, item.polygon, item.minHeight, item.height);
      }

      res.push({
        id: item.id,
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
          Triangulate.cylinder(tris, center, radius, radius/2, item.height, item.height+item.roofHeight);
          Triangulate.circle(tris, center, radius/2, item.height+item.roofHeight);
        break;

        case 'pyramid':
          Triangulate.pyramid(tris, item.polygon, center, item.height, item.height+item.roofHeight);
        break;

        default:
          if (item.shape === 'cylinder') {
            Triangulate.circle(tris, center, radius, item.height);
          } else if (item.shape === undefined) {
            Triangulate.polygon(tris, item.polygon, item.height);
          }
      }

      res.push({
        id: item.id,
        color: item.roofColor,
        vertices: tris.vertices,
        normals: tris.normals
      });
    }

    var worldSize = 2 <<16;
    var position = unproject(originX, originY, EARTH_CIRCUMFERENCE);
    return { items:res, position:position };
  };

}());
