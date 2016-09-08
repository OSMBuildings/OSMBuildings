
/**
 * superclass for roofs based on roof:type tags.
 * Contains common functionality, such as roof height parsing.
 */
var TaggedRoof = module.exports = function(tags, polygon) {
  this.tags = tags;
  this.polygon = polygon;

  var taggedHeight;
  if (this.tags.roofHeight) {
    var heightValue = this.tags.roofHeight;
    taggedHeight = parseMeasure(heightValue);
  } else if (this.getValue('roofLevels') !== null) {
    taggedHeight = HEIGHT_PER_LEVEL*parseFloat(this.tags.roofLevels);
  }

  this.roofHeight = taggedHeight !== null ? taggedHeight : this.getDefaultRoofHeight();

  // TODO: var -> this.heightWithoutRoof
};

/**
 * returns the outline (with holes) of the roof.
 * The shape will be generally identical to that of the
 * building itself, but additional vertices might have
 * been inserted into segments.
 */
TaggedRoof.prototype.getPolygon = function() {
  return this.polygon;
};

/**
 * returns segments within the roof polygon
 * that define apex nodes of the roof
 */
TaggedRoof.prototype.getInnerPoints = function() {
};

/**
 * returns segments within the roof polygon
 * that define ridges or edges of the roof
 */
TaggedRoof.prototype.getInnerSegments = function() {
};

/**
 * default roof height if no value is tagged explicitly.
 * Can optionally be overwritten by subclasses.
 */
TaggedRoof.prototype.getDefaultRoofHeight = function() {
  if (this.tags.buildingLevels === 1) {
    return 1;
  }
  return DEFAULT_RIDGE_HEIGHT;
};

/**
 * returns maximum roof height
 */
TaggedRoof.prototype.getHeight = function() {
  return this.tags.roofHeight;
};

/**
 * returns maximum roof elevation
 */
TaggedRoof.prototype.getMaxZ = function() {
  return this.heightWithoutRoof + this.roofHeight;
};
