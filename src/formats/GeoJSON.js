
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

//  item.hitColor = HitAreas.idToColor(item.relationId || item.id);

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

  function transform(offsetX, offsetY, zoom, coordinates) {
    var
      worldSize = TILE_SIZE * Math.pow(2, zoom),
      res = [],
      r, rl, p,
      ring;

    for (var c = 0, cl = coordinates.length; c < cl; c++) {
      ring = coordinates[c];
      res[c] = [];
      for (r = 0, rl = ring.length-1; r < rl; r++) {
        p = project(ring[r][1], ring[r][0], worldSize);
        res[c][r] = [p.x-offsetX, p.y-offsetY];
      }
    }

    return res;
  }

  GeoJSON.read = function(offsetX, offsetY, zoom, geojson) {
    if (!geojson || geojson.type !== 'FeatureCollection') {
      return [];
    }

    var
      collection = geojson.features,
      feature,
      geometries,
      data = {
        vertices: [],
        normals: [],
        colors: [],
        idColors: []
      },
      j, jl,
      item, polygon, bbox, radius, center, id;

    for (var i = 0, il = collection.length; i < il; i++) {
      feature = collection[i];

      if (!(item = alignProperties(feature.properties))) {
        continue;
      }

      geometries = getGeometries(feature.geometry);

      for (j = 0, jl = geometries.length; j < jl; j++) {
        polygon = transform(offsetX, offsetY, zoom, geometries[j]);

        if ((item.roofShape === 'cone' || item.roofShape === 'dome') && !item.shape && isRotational(polygon)) {
          item.shape = 'cylinder';
          item.isRotational = true;
        }

        bbox = getBBox(polygon);
        center = [ bbox.minX + (bbox.maxX-bbox.minX)/2, bbox.minY + (bbox.maxY-bbox.minY)/2 ];

        if (item.isRotational) {
          radius = (bbox.maxX-bbox.minX)/2;
        }

        idColor = Interaction.idToColor(feature.properties.relationId || feature.id || feature.properties.id);

        switch (item.shape) {
          case 'cylinder':
            Triangulate.cylinder(data, center, radius, radius, item.minHeight, item.height, item.wallColor, idColor);
            Triangulate.circle(data, center, radius, item.height, item.roofColor, idColor);
          break;

          case 'cone':
            Triangulate.cylinder(data, center, radius, 0, item.minHeight, item.height, item.wallColor, idColor);
          break;

          case 'sphere':
            Triangulate.cylinder(data, center, radius, radius/2, item.minHeight, item.height, item.wallColor, idColor);
            Triangulate.circle(data, center, radius/2, item.height, item.roofColor, idColor);
          break;

          case 'pyramid':
            Triangulate.pyramid(data, polygon, center, item.minHeight, item.height, item.wallColor, idColor);
          break;

          default:
            Triangulate.extrusion(data, polygon, item.minHeight, item.height, item.wallColor, idColor);
            Triangulate.polygon(data, polygon, item.height, item.roofColor, idColor);
        }

        switch (item.roofShape) {
          case 'cone':
            Triangulate.cylinder(data, center, radius, 0, item.height, item.height+item.roofHeight, item.roofColor, idColor);
          break;

          case 'dome':
            Triangulate.cylinder(data, center, radius, radius/2, item.height, item.height+item.roofHeight, item.roofColor, idColor);
            Triangulate.circle(data, center, radius/2, item.height+item.roofHeight, item.roofColor, idColor);
          break;

          case 'pyramid':
            Triangulate.pyramid(data, polygon, center, item.height, item.height+item.roofHeight, item.roofColor, idColor);
          break;
        }
      }
    }

    return data;
  };

}());
