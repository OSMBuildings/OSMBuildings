
var Mesh = function(url, options) {
  options = options || {};

  this.isReady = false;

  this.id        = options.id;
  this.position  = options.position  || {};
  this.scale     = options.scale     || 1;
  this.rotation  = options.rotation  || 0;
  this.elevation = options.elevation || 0;
  if (options.color) {
    this.color = Color.parse(options.color).toRGBA(true);
  }
  this.replaces  = options.replaces || [];

  Data.add(this);
  Events.on('modify', this.modify.bind(this));
};

(function() {

  Mesh.prototype = {

    _setItems: function(itemList) {
      this.items = [];

      var vertices = [], normals = [], colors = [], idColors = [];
      var item, idColor, j, jl;

      for (var i = 0, il = itemList.length; i<il; i++) {
        item = itemList[i];
        item.color = this.color || item.color || DEFAULT_COLOR;
        item.id = this.id || item.id;
        item.numVertices = item.vertices.length/3;

        idColor = Interaction.idToColor(item.id);
        for (j = 0, jl = item.vertices.length - 2; j<jl; j += 3) {
          vertices.push(item.vertices[j], item.vertices[j + 1], item.vertices[j + 2]);
          normals.push(item.normals[j], item.normals[j + 1], item.normals[j + 2]);
          idColors.push(idColor.r/255, idColor.g/255, idColor.b/255);
        }

        delete item.vertices;
        delete item.normals;

        this.items.push(item);
      }

      this.vertexBuffer = new glx.Buffer(3, new Float32Array(vertices));
      this.normalBuffer = new glx.Buffer(3, new Float32Array(normals));
      this.idColorBuffer = new glx.Buffer(3, new Float32Array(idColors));

      this.modify();

      vertices = null;
      normals = null;
      idColors = null;

      itemList = null;
    },

    _replaceItems: function() {
      if (this.replaces.length) {
        var replaces = this.replaces;
        Data.addModifier(function(item) {
          if (replaces.indexOf(item.id)>=0) {
            item.hidden = true;
          }
        });
      }
    },

    modify: function() {
      if (!this.items) {
        return;
      }

      var
        item,
        newColors = [],
        newVisibilities = [];

      for (var i = 0, il = this.items.length; i<il; i++) {
        item = this.items[i];
        Data.applyModifiers(item);
        for (var j = 0, jl = item.numVertices; j<jl; j++) {
          newColors.push(item.color.r, item.color.g, item.color.b);
          newVisibilities.push(item.hidden ? 1 : 0);
        }
      }

      this.colorBuffer = new glx.Buffer(3, new Float32Array(newColors));
      this.visibilityBuffer = new glx.Buffer(1, new Float32Array(newVisibilities));

      newColors = null;
      newVisibilities = null;

      return this;
    },

    destroy: function() {
      Data.remove(this);

      if (this.isReady) {
        this.vertexBuffer.destroy();
        this.normalBuffer.destroy();
        this.colorBuffer.destroy();
        this.idColorBuffer.destroy();
        this.visibilityBuffer.destroy();
      }

      if (this.request) {
        this.request.abort();
        this.request = null;
      }
    }
  };

}());
