
var CityGML = {};

//var XMLStream     = require('../XMLStream.js');
//var TextureColors = require('./TextureColors.js');
//var proj4js       = require('../../lib/proj4js/dist/proj4.js');
//var projections   = require('../../util/projections.js');
//var geometry      = require('../../util/geometry.js');
//var fs            = require('fs');
//var path          = require('path');

//*****************************************************************************

(function() {

	var ns = {
    gml: 'http://www.opengis.net/gml',
    bldg: 'http://www.opengis.net/citygml/building/1.0',
    app: 'http'
  };

  function parseNumbers(node) {
    var str = node.children[0].nodeValue;
    return JSON.parse('[' + str.replace(/\s+/g, ',') + ']');
  }

  // TODO: 'CityModel/gml:boundedBy/gml:Envelope/gml:lowerCorner' // for whole file    
  function getBounds(node) {
    var boundedBy = node.getElementsByTagNameNS(ns.gml, 'boundedBy');
		var envelope = boundedBy[0].getElementsByTagNameNS(ns.gml, 'Envelope');
		var srs = envelope[0].attributes.getNamedItem('srsName').value;
		var lowerCorner = parseNumbers(envelope[0].getElementsByTagNameNS(ns.gml, 'lowerCorner')[0]);
		var upperCorner = parseNumbers(envelope[0].getElementsByTagNameNS(ns.gml, 'upperCorner')[0]);

		return { srs:srs, min:lowerCorner, max:upperCorner };
  }

  CityGML.load = function(url, callback) {
    Request.getXML(url, function(xml) {
      var buildings = xml.getElementsByTagNameNS(ns.bldg, 'Building');
debugger
      var bldg, texture;
      for (var i = 0, il = buildings.length; i < il; i++) {
        bldg = buildings[i];
        getBounds(bldg);
      
        texture = bldg.getElementsByTagNameNS(ns.app, 'ParameterizedTexture');
       
//        // texture file
//        if (texture.'/app:surfaceDataMember/app:ParameterizedTexture/app:imageURI') {
//          var textureFile = node.value;
//        }
//        // texture coordinates
//        if (texture.'/app:ParameterizedTexture/app:target/app:TexCoordList/app:textureCoordinates') {
//          var polygonId = node.attributes.ring.substring(1);
//          this._textureIndex[polygonId] = this._textureFile;
//        }
//      }

//      console.log(doc);
    });
  };

/**
  this._baseFile = path.basename(srcPath).replace(/\.[^\.]+$/i, '');
  this._srcProj = projections[srcSRS];
  this._dstProj = projections[dstSRS || 'EPSG:4326' ];

  this._offLat = Infinity;
  this._offLon = Infinity;
  this._minZ = 0;
  this._texColors = {};

//  fs.readFile(this._baseDir +'/'+ this._baseFile + '.texcolors.json', function(err, str) {
//    if (!err) {
//      this._texColors = JSON.parse(str);
//      this.resume();
//    } else {
//      console.log('texture color file doesn\'t exist. Creating...');
//      var textureColors = new TextureColors(srcPath);
//      textureColors.on('end', function(json) {
//        this._texColors = json;
//        this.resume();
//      }.bind(this));
//    }
//  }.bind(this));


CityGML.prototype._onNode = function(node) {

  if (node.name === 'bldg:Building') {

    this._writeBuilding();

    this._buildingId = node.attributes['gml:id'];
    this._walls = [];
    this._roofs = [];
    this._wallColors = { r:0, g:0, b:0, c:0 };
    this._roofColors = { r:0, g:0, b:0, c:0 };
    this._textureIndex = {};
    return;
  }








//  CityModel/cityObjectMember/bldg:Building/bldg:boundedBy/bldg:RoofSurface/bldg:lod2MultiSurface/gml:MultiSurface/gml:surfaceMember/gml:Polygon/gml:exterior/gml:LinearRing/gml:posList	78724
//  CityModel/cityObjectMember/bldg:Building/bldg:boundedBy/bldg:RoofSurface/bldg:lod2MultiSurface/gml:MultiSurface/gml:surfaceMember/gml:Polygon/gml:interior/gml:LinearRing/gml:posList	588
//  CityModel/cityObjectMember/bldg:Building/bldg:boundedBy/bldg:WallSurface/bldg:lod2MultiSurface/gml:MultiSurface/gml:surfaceMember/gml:Polygon/gml:exterior/gml:LinearRing/gml:posList	275673
//  CityModel/cityObjectMember/bldg:Building/bldg:consistsOfBuildingPart/bldg:BuildingPart/bldg:boundedBy/bldg:RoofSurface/bldg:lod2MultiSurface/gml:MultiSurface/gml:surfaceMember/gml:Polygon/gml:exterior/gml:LinearRing/gml:posList	239
//  CityModel/cityObjectMember/bldg:Building/bldg:consistsOfBuildingPart/bldg:BuildingPart/bldg:boundedBy/bldg:RoofSurface/bldg:lod2MultiSurface/gml:MultiSurface/gml:surfaceMember/gml:Polygon/gml:interior/gml:LinearRing/gml:posList	4
//  CityModel/cityObjectMember/bldg:Building/bldg:consistsOfBuildingPart/bldg:BuildingPart/bldg:boundedBy/bldg:WallSurface/bldg:lod2MultiSurface/gml:MultiSurface/gml:surfaceMember/gml:Polygon/gml:exterior/gml:LinearRing/gml:posList	1216
//  CityModel/cityObjectMember/bldg:Building/bldg:lod2MultiSurface/gml:MultiSurface/gml:surfaceMember/gml:CompositeSurface/gml:surfaceMember/gml:Polygon/gml:exterior/gml:LinearRing/gml:posList	3135

  if (node.name === 'gml:posList' && this.pathEnds('/gml:Polygon/gml:exterior/gml:LinearRing/gml:posList')) {
    var srcCoord = parseNumbers(node.value);
    var dstCoord = [];
    var p;
    var x, y, z, X, Y, Z;

    for (var i = 0, il = srcCoord.length-2; i < il; i+=3) {
      p = proj4js(this._srcProj, this._dstProj, [ srcCoord[i], srcCoord[i+1] ]);

      x = (p[0]*100000<<0)/100000;
      y = (p[1]*100000<<0)/100000;
      z = ((srcCoord[i+2]-this._minZ)*100<<0)/100;

      // skip identical points
      // TODO: enable tolerance, also skip colinear points
      if (i && x === X && y === Y && z === Z) {
        continue;
      }

      dstCoord.push(X = x, Y = y, Z = z);
    }

    //dstCoord = geometry.clean(dstCoord);

    if (dstCoord.length < 9) { // 3 points * 3 dimensions
      return;
    }

    if (~this.path.indexOf('bldg:GroundSurface')) {
      this._footprint = dstCoord;
    } else {
      var polygonId = node.parent.attributes['gml:id'];
      var type = ~this.path.indexOf('bldg:RoofSurface') ? 'roof' : 'wall';
      var color = this._texColors[polygonId];

      if (type === 'roof') {
        this._roofs.push(dstCoord);
        if (color) {
          this._roofColors.c++;
          this._roofColors.r += color[0];
          this._roofColors.g += color[1];
          this._roofColors.b += color[2];
        }
      } else {
        this._walls.push(dstCoord);
        if (color) {
          this._wallColors.c++;
          this._wallColors.r += color[0];
          this._wallColors.g += color[1];
          this._wallColors.b += color[2];
        }
      }
    }

    return;
  }
};

CityGML.prototype._writeBuilding = function() {
  if (!this._buildingId) {
    return;
  }

  console.log('\033[ Reading XML ' + Math.round(this.bytesRead / this.bytesTotal * 100) + '%\033[1A');

  var building = {
    id: this._buildingId,
   //footprint: this._footprint,
   //height: this._height,
    walls: this._walls,
    roofs: this._roofs
  };

  building.wallColor = this._wallColors.c ? [this._wallColors.r/this._wallColors.c<<0, this._wallColors.g/this._wallColors.c<<0, this._wallColors.b/this._wallColors.c<<0] : [200, 200, 200];
  building.roofColor = this._roofColors.c ? [this._roofColors.r/this._roofColors.c<<0, this._roofColors.g/this._roofColors.c<<0, this._roofColors.b/this._roofColors.c<<0] : [100, 70, 60];

  this._target.write(this._separator + JSON.stringify(building));
  if (!this._separator) this._separator = ',\n';
};

CityGML.prototype._onEnd = function() {
  this._writeBuilding();

  var p = proj4js(this._srcProj, this._dstProj, [this._offLon, this._offLat]);
  this._target.write(
      '\n],\n'+
      '"offset":{"latitude":'+ p[1].toFixed(5) +',"longitude":'+ p[0].toFixed(5) +'}'+
      '}');
  this._target.end();
};

CityGML.prototype.pipe = function(target) {
  this._target = target;
  this._target.write('{"meshes":[\n');
};
***/

}());
