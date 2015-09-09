
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

  function isClockWise(latlngs) {
    return 0 < latlngs.reduce(function(a, b, c, d) {
      return a + ((c < d.length - 1) ? (d[c+1][0] - b[0]) * (d[c+1][1] + b[1]) : 0);
    }, 0);
  }

  function parseFeature(res, feature, origin, worldSize) {
    var
      prop = feature.properties,
      item = {},
      color,
      wallColor, roofColor;

    if (!prop) {
      return;
    }

    item.height    = prop.height    || (prop.levels   ? prop.levels  *METERS_PER_LEVEL : DEFAULT_HEIGHT);
    item.minHeight = prop.minHeight || (prop.minLevel ? prop.minLevel*METERS_PER_LEVEL : 0);

    wallColor = prop.material ? getMaterialColor(prop.material) : (prop.wallColor || prop.color);
    item.wallColor = (color = Color.parse(wallColor)) ? color.toRGBA(true) : DEFAULT_COLOR;

    roofColor = prop.roofMaterial ? getMaterialColor(prop.roofMaterial) : prop.roofColor;
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

    //if (item.height+item.roofHeight <= item.minHeight) {
    //  return;
    //}

    item.id = prop.relationId || feature.id || prop.id;

    var geometries = getGeometries(feature.geometry, origin, worldSize);
    var clonedItem = Object.create(item);

    for (var i = 0, il = geometries.length; i < il; i++) {
      clonedItem.geometry = geometries[i];

      var ring = geometries[i][0];
      var x = y = Infinity, X = Y = -Infinity;
      for (var j = 0; j < ring.length; j++) {
        x = Math.min(x, ring[j][0]);
        y = Math.min(y, ring[j][1]);

        X = Math.max(X, ring[j][0]);
        Y = Math.max(Y, ring[j][1]);
      }

      clonedItem.min = { x:x, y:y };
      clonedItem.max = { x:X, y:Y };

      res.push(clonedItem);
    }
  }

  function getGeometries(geometry, origin, worldSize) {
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
      //res[i] = isClockWise(polygonRings[i]) && !i ? polygonRings[i] : polygonRings[i].reverse();
      res[i] = transform(polygonRings[i], origin, worldSize);
    }

    return [res];
  }

  function transform(ring, origin, worldSize) {
    var p, res = [];
    for (var i = 0, len = ring.length; i < len; i++) {
      p = project(ring[i][1], ring[i][0], worldSize);
      res[i] = [p.x-origin.x, p.y-origin.y];
    }

    return res;
  }

  //function getBBox(ring) {
  //  var x = y = Infinity, X = Y = -Infinity;
  //  for (var i = 0; i < ring.length; i++) {
  //    x = Math.min(x, ring[i][0]);
  //    y = Math.min(y, ring[i][1]);
  //
  //    X = Math.max(X, ring[i][0]);
  //    Y = Math.max(Y, ring[i][1]);
  //  }
  //
  //  return {
  //    min: { x:x, y:y },
  //    max: { x:X, y:Y }
  //  };
  //}


  //***************************************************************************

  GeoJSON.parse = function(position, worldSize, geojson) {
    var res = [];

    if (geojson && geojson.type === 'FeatureCollection' && geojson.features.length) {

      var
        collection = geojson.features,
        origin = project(position.latitude, position.longitude, worldSize);

      for (var i = 0, il = collection.length; i<il; i++) {
        parseFeature(res, collection[i], origin, worldSize);
      }
    }

    return res;
  };

}());
