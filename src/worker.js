importScripts('Request.js', './mesh/index.js', './mesh/GeoJSON.js', './triangulate/index.js', './../node_modules/qolor/dist/Qolor.js');
importScripts('./triangulate/roofs/index.js', './triangulate/roofs/Tools.js', './triangulate/split.js', './triangulate/earcut.custom.js', './triangulate/geometry/vec3.js', './triangulate/geometry/vec2.js');
importScripts('./render/index.js', './render/Picking.js');
//importScripts('./variables.js');
//importScripts('./Activity.js');
//importScripts('./glx/index.js', './glx/Buffer.js');


self.addEventListener('message', function(e) {



    var items = e.data.object.items    

    var downloadData = Request.getJSON(e.data.url, function(data) {        
        var temp = setData(data, items);  
        console.log(e.data)           
        self.postMessage({res: temp.res, items: temp.items, resPickingColors: temp.resPickingColors, position: temp.posi});  

    });
 
}, false);


function setData(collection, items) {

      if (!collection || !collection.features.length) {
        return;
      }

      var res = {
        vertices: [],
        normals: [],
        colors: [],
        texCoords: []
      };

      var
        resPickingColors = [],
        position = this.getOrigin(collection.features[0].geometry),       
        numFeatures = collection.features.length;        

      var posi = { latitude:position[1], longitude:position[0] };

      
      var feature, properties, id, vertexCountBefore, vertexCount, pickingColor;

      for (var i = 0; i < numFeatures; i++) {
          feature = collection.features[i];

          //APP.emit('loadfeature', feature);
          
          properties = feature.properties;
          id = this.forcedId || properties.relationId || feature.id || properties.id;

          vertexCountBefore = res.vertices.length;

          triangulate(res, feature, position, this.forcedColor);

          vertexCount = (res.vertices.length - vertexCountBefore)/3;

          pickingColor = render.Picking.idToColor(id);
          for (var j = 0; j < vertexCount; j++) {
            [].push.apply(resPickingColors, pickingColor);
          }

          items.push({ id:id, vertexCount:vertexCount, height:properties.height, data:properties.data });

         
      }    

       res.vertices     = new Float32Array(res.vertices);
       res.normals      = new Float32Array(res.normals);
       res.colors       = new Float32Array(res.colors);
       res.texCoords    = new Float32Array(res.texCoords);
       resPickingColors = new Float32Array(resPickingColors);


      return {res: res, resPickingColors: resPickingColors, items: items, posi:posi};

}


function getOrigin(geometry) {
 
      var coordinates = geometry.coordinates;
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