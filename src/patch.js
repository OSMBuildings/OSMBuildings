
// add functionality/fixes that needs to be applied to somewhere externally

var patch = {};

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
    if (typeof str !== 'string') {
      return null;
    }
    str = str.toLowerCase();
    if (str[0] === '#') {
      return str;
    }
    return materialColors[baseMaterials[str] || str] || null;
  }

  //***************************************************************************

  patch.GeoJSON = function(prop) {
    prop.height    = prop.height    || (prop.levels   ? prop.levels  *METERS_PER_LEVEL : DEFAULT_HEIGHT);
    prop.minHeight = prop.minHeight || (prop.minLevel ? prop.minLevel*METERS_PER_LEVEL : 0);

    prop.wallColor = prop.wallColor || prop.color || getMaterialColor(prop.material);
    prop.roofColor = prop.roofColor || prop.color || getMaterialColor(prop.roofMaterial);

    switch (prop.shape) {
      case 'cylinder':
      case 'cone':
      case 'dome':
      case 'sphere':
        prop.isCircular = true;
        break;

      case 'pyramid':
        break;
    }

    switch (prop.roofShape) {
      case 'cone':
      case 'dome':
        prop.isCircular = true;
        break;

      case 'pyramid':
        break;
    }

    if (prop.roofShape && prop.roofHeight) {
      prop.height = Math.max(0, prop.height-prop.roofHeight);
    } else {
      prop.roofHeight = 0;
    }

    //if (prop.height+prop.roofHeight <= prop.minHeight) {
    //  return;
    //}

    return prop;
  };

}());
